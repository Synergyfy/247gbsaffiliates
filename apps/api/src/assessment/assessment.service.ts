import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { Question, TargetingLevel, TargetingType } from './entities/question.entity';
import { QuizAttempt } from './entities/quiz_attempt.entity';
import { UsersService } from '../users/users.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Category } from '../categories/entities/category.entity';
import { Sector } from '../sectors/entities/sector.entity';

@Injectable()
export class AssessmentService implements OnModuleInit {
  private readonly logger = new Logger(AssessmentService.name);

  constructor(
    @InjectRepository(Question)
    private questionRepo: Repository<Question>,
    @InjectRepository(QuizAttempt)
    private attemptRepo: Repository<QuizAttempt>,
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Sector)
    private sectorRepo: Repository<Sector>,
    private usersService: UsersService,
  ) {}

  async createQuestion(dto: CreateQuestionDto) {
    const { categoryIds, sectorIds, ...data } = dto;
    
    const question = this.questionRepo.create(data);

    if (categoryIds?.length) {
      question.categories = await this.categoryRepo.findBy({ id: In(categoryIds) });
    }
    if (sectorIds?.length) {
      question.sectors = await this.sectorRepo.findBy({ id: In(sectorIds) });
    }

    return this.questionRepo.save(question);
  }

  async generateQuiz(userId?: string) {
    let userSectorId: string | null = null;
    let userCategoryId: string | null = null;
    let userSubCategoryId: string | null = null;

    // Fetch user context if logged in
    if (userId) {
      const user = await this.usersService.findOne(userId);
      userSectorId = user.sectorId;
      userCategoryId = user.categoryId;
      userSubCategoryId = user.subCategoryId;
    }

    // Complex targeting query
    const qb = this.questionRepo.createQueryBuilder('q')
      .leftJoinAndSelect('q.sectors', 's')
      .leftJoinAndSelect('q.categories', 'c')
      .where('q.targetingLevel = :global', { global: TargetingLevel.GLOBAL });

    if (userId) {
      qb.orWhere(new Brackets(qbLevel => {
        // Sector Level Logic
        if (userSectorId) {
          qbLevel.orWhere(new Brackets(qbSector => {
            qbSector.where('q.targetingLevel = :sector', { sector: TargetingLevel.SECTOR })
              .andWhere(new Brackets(qbType => {
                 qbType.where('q.targetingType = :all', { all: TargetingType.ALL })
                       .orWhere('q.targetingType = :include AND s.id = :sid', { sid: userSectorId })
                       .orWhere('q.targetingType = :exclude AND s.id != :sid', { sid: userSectorId }); // Simplified exclude for single match
              }));
          }));
        }

        // Category Level Logic
        if (userCategoryId) {
          qbLevel.orWhere(new Brackets(qbCat => {
            qbCat.where('q.targetingLevel = :cat', { cat: TargetingLevel.CATEGORY })
              .andWhere(new Brackets(qbType => {
                 qbType.where('q.targetingType = :all', { all: TargetingType.ALL })
                       .orWhere('q.targetingType = :include AND c.id = :cid', { cid: userCategoryId })
                       .orWhere('q.targetingType = :exclude AND c.id != :cid', { cid: userCategoryId });
              }));
          }));
        }

         // SubCategory Level Logic
         if (userSubCategoryId) {
          qbLevel.orWhere(new Brackets(qbSub => {
            qbSub.where('q.targetingLevel = :sub', { sub: TargetingLevel.SUB_CATEGORY })
              .andWhere(new Brackets(qbType => {
                 qbType.where('q.targetingType = :all', { all: TargetingType.ALL })
                       .orWhere('q.targetingType = :include AND c.id = :subid', { subid: userSubCategoryId })
                       .orWhere('q.targetingType = :exclude AND c.id != :subid', { subid: userSubCategoryId });
              }));
          }));
        }
      }));
    }

    let questions = await qb.orderBy('RANDOM()').limit(10).getMany();

    if (questions.length === 0) {
      // Fallback to any available questions or seed default questions
      const totalCount = await this.questionRepo.count();
      if (totalCount === 0) {
        await this.seedQuestions();
      }
      questions = await this.questionRepo.find({
        take: 10,
      });
    }

    // Hide correct answer and internal targeting fields
    return questions.map(q => ({
      id: q.id,
      text: q.text,
      type: q.type,
      options: q.options,
      weight: q.weight
    }));
  }

  // ... submitQuiz and seedQuestions remain similar ...
  async submitQuiz(userId: string, answers: { questionId: string; selectedOptionIndex: number }[]) {
      // Fetch all questions in a single query to avoid N+1
      const questionIds = answers.map(a => a.questionId);
      const questions = await this.questionRepo.findBy({ id: In(questionIds) });
      const questionMap = new Map(questions.map(q => [q.id, q]));

      let score = 0;
      let maxScore = 0;

      for (const ans of answers) {
        const question = questionMap.get(ans.questionId);
        if (question) {
          maxScore += question.weight;
          if (question.correctOptionIndex === ans.selectedOptionIndex) {
            score += question.weight;
          }
        }
      }

      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : (answers.length === 0 ? 100 : 0);
      let band = 'Fail';
      if (percentage >= 85) band = 'Pass';
      else if (percentage >= 50) band = 'Partial';

      if (band === 'Pass' || band === 'Partial') {
        await this.usersService.setQuizPassed(userId);
      }

      const attempt = this.attemptRepo.create({
        userId,
        score,
        maxScore,
        percentage,
        band,
        answers,
      });

      await this.attemptRepo.save(attempt);

      return { score, maxScore, percentage, band };
    }

  async onModuleInit() {
    await this.seedQuestions();
  }

  private async seedQuestions() {
    try {
      const count = await this.questionRepo.count();
      if (count > 0) return;

      this.logger.log('Seeding initial onboarding assessment questions...');
      const defaultQuestions: Partial<Question>[] = [
        {
          text: 'A prospective business client expresses interest in 247GBS enterprise services but is unsure which solution fits their compliance needs. What is the most effective next step?',
          type: 'scenario',
          options: [
            'Immediately close them on the highest-tier package without qualification.',
            'Conduct a discovery session to evaluate their operational requirements and recommend the appropriate customized solution.',
            "Refer them to a competitor's public documentation.",
            'Wait for them to research all packages on their own.'
          ],
          correctOptionIndex: 1,
          weight: 2,
          targetingLevel: TargetingLevel.GLOBAL,
          targetingType: TargetingType.ALL
        },
        {
          text: 'What is the primary role of an Affiliate / Partner in the 247GBS network?',
          type: 'multiple_choice',
          options: [
            'To promote authorized 247GBS solutions, refer qualified clients, and uphold network compliance and integrity.',
            'To rebrand and resell third-party services without company approval.',
            'To handle independent banking settlements outside the platform.',
            'To provide unauthorized discounts without corporate approval.'
          ],
          correctOptionIndex: 0,
          weight: 1,
          targetingLevel: TargetingLevel.GLOBAL,
          targetingType: TargetingType.ALL
        },
        {
          text: 'A client asks for confidential pricing details or special contract terms not listed in standard affiliate collateral. How should you respond?',
          type: 'scenario',
          options: [
            'Make up a provisional rate card on the spot to secure the deal.',
            'Escalate the requirement to your designated Account Manager or partner support team for formal enterprise review.',
            "Share another client's proprietary invoice as an example.",
            'Refuse to assist the client any further.'
          ],
          correctOptionIndex: 1,
          weight: 2,
          targetingLevel: TargetingLevel.GLOBAL,
          targetingType: TargetingType.ALL
        },
        {
          text: 'Under 247GBS partner policies, which practices are strictly prohibited when generating leads?',
          type: 'multiple_choice',
          options: [
            'Publishing informative case studies and verified solutions overview.',
            'Using misleading claims, spam emailing, or unverified performance guarantees.',
            'Hosting client discovery webinars.',
            'Attending authorized business networking events.'
          ],
          correctOptionIndex: 1,
          weight: 1,
          targetingLevel: TargetingLevel.GLOBAL,
          targetingType: TargetingType.ALL
        },
        {
          text: 'During an onboarding consultation, a client is facing technical integration challenges with their dashboard. What should you do?',
          type: 'scenario',
          options: [
            'Attempt to modify system database scripts directly.',
            'Guide them through standard setup docs and log an expedited support ticket with technical operations.',
            'Advise them to discontinue using the platform.',
            'Ignore the issue since technical onboarding is not your responsibility.'
          ],
          correctOptionIndex: 1,
          weight: 2,
          targetingLevel: TargetingLevel.GLOBAL,
          targetingType: TargetingType.ALL
        },
        {
          text: 'How are commission payouts and referral rewards tracked on the 247GBS Affiliate platform?',
          type: 'multiple_choice',
          options: [
            'Transparently recorded via your affiliate referral link, client tracking IDs, and the real-time analytics dashboard.',
            'Through manual paper receipts submitted at the end of each year.',
            'Only through external social media likes.',
            'They are randomly calculated by third-party buyers.'
          ],
          correctOptionIndex: 0,
          weight: 1,
          targetingLevel: TargetingLevel.GLOBAL,
          targetingType: TargetingType.ALL
        },
        {
          text: 'You identify a high-value opportunity in a sector you are not yet certified in. What is the recommended course of action?',
          type: 'scenario',
          options: [
            'Collaborate with a certified Sector Specialist / Consultant within the network to co-deliver the client solution.',
            'Deliver advice without understanding regulatory implications.',
            'Cancel the engagement entirely.',
            'Promise non-compliant deliverables.'
          ],
          correctOptionIndex: 0,
          weight: 2,
          targetingLevel: TargetingLevel.GLOBAL,
          targetingType: TargetingType.ALL
        },
        {
          text: 'What standard of data privacy must be maintained when collecting prospective client contact details?',
          type: 'multiple_choice',
          options: [
            'No restrictions apply to commercial contact info.',
            'Strict compliance with GDPR/data privacy laws and obtaining explicit consent for communication.',
            'Selling prospective lead lists to third-party brokers.',
            'Publicly sharing lead data on open forums.'
          ],
          correctOptionIndex: 1,
          weight: 1,
          targetingLevel: TargetingLevel.GLOBAL,
          targetingType: TargetingType.ALL
        }
      ];

      for (const qData of defaultQuestions) {
        const q = this.questionRepo.create(qData);
        await this.questionRepo.save(q);
      }
      this.logger.log(`Successfully seeded ${defaultQuestions.length} assessment questions.`);
    } catch (err) {
      this.logger.error('Error seeding questions', err);
    }
  }
}


