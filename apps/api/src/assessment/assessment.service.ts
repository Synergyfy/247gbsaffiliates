import { Injectable, OnModuleInit, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { Question, TargetingLevel, TargetingType } from './entities/question.entity';
import { QuizAttempt } from './entities/quiz_attempt.entity';
import { UsersService } from '../users/users.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Category } from '../categories/entities/category.entity';
import { Sector } from '../sectors/entities/sector.entity';
import { AssessmentAssignment, AssessmentQuestionSnapshot } from './entities/assessment-assignment.entity';
import { UserRole } from '../users/entities/user.entity';

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
    @InjectRepository(AssessmentAssignment)
    private assignmentRepo: Repository<AssessmentAssignment>,
    private usersService: UsersService,
  ) {}

  async createQuestion(dto: CreateQuestionDto) {
    const { categoryIds, sectorIds, ...data } = dto;
    if (!data.options?.length || data.correctOptionIndex < 0 || data.correctOptionIndex >= data.options.length) {
      throw new BadRequestException('The correct answer must point to one of the supplied options.');
    }
    
    const question = this.questionRepo.create(data);

    if (categoryIds?.length) {
      question.categories = await this.categoryRepo.findBy({ id: In(categoryIds) });
    }
    if (sectorIds?.length) {
      question.sectors = await this.sectorRepo.findBy({ id: In(sectorIds) });
    }

    return this.questionRepo.save(question);
  }

  async getAdminQuestions() {
    return this.questionRepo.find({ relations: ['categories', 'sectors'], order: { text: 'ASC' } });
  }

  async updateQuestion(id: string, dto: UpdateQuestionDto) {
    const question = await this.questionRepo.findOne({ where: { id }, relations: ['categories', 'sectors'] });
    if (!question) throw new NotFoundException('Assessment question not found.');
    const { categoryIds, sectorIds, ...fields } = dto;
    const options = fields.options ?? question.options;
    const answerIndex = fields.correctOptionIndex ?? question.correctOptionIndex;
    if (!options?.length || answerIndex < 0 || answerIndex >= options.length) {
      throw new BadRequestException('The correct answer must point to one of the supplied options.');
    }
    Object.assign(question, fields);
    if (categoryIds !== undefined) {
      const categories = categoryIds.length ? await this.categoryRepo.findBy({ id: In(categoryIds) }) : [];
      if (categories.length !== categoryIds.length) throw new BadRequestException('One or more assessment categories were not found.');
      question.categories = categories;
    }
    if (sectorIds !== undefined) {
      const sectors = sectorIds.length ? await this.sectorRepo.findBy({ id: In(sectorIds) }) : [];
      if (sectors.length !== sectorIds.length) throw new BadRequestException('One or more assessment sectors were not found.');
      question.sectors = sectors;
    }
    return this.questionRepo.save(question);
  }

  async deleteQuestion(id: string) {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Assessment question not found.');
    await this.questionRepo.remove(question);
    return { id, deleted: true };
  }

  async getAdminAttempts() {
    const attempts = await this.attemptRepo.createQueryBuilder('attempt')
      .leftJoin('attempt.user', 'user')
      .select(['attempt.id', 'attempt.userId', 'attempt.score', 'attempt.maxScore', 'attempt.percentage', 'attempt.band', 'attempt.answers', 'attempt.createdAt', 'user.id', 'user.email', 'user.firstName', 'user.lastName'])
      .orderBy('attempt.createdAt', 'DESC')
      .take(200)
      .getMany();
    return attempts.map((attempt) => ({
      id: attempt.id,
      userId: attempt.userId,
      user: attempt.user ? { id: attempt.user.id, email: attempt.user.email, firstName: attempt.user.firstName, lastName: attempt.user.lastName } : null,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      band: attempt.band,
      answers: attempt.answers,
      createdAt: attempt.createdAt,
    }));
  }

  async createAssignments(input: { title: string; instructions?: string; dueAt?: string | null; affiliateIds: string[]; questionIds: string[] }, adminId: string) {
    const title = String(input?.title ?? '').trim();
    const affiliateIds = Array.isArray(input?.affiliateIds) ? [...new Set(input.affiliateIds.filter((id) => typeof id === 'string' && id.trim()))] : [];
    const questionIds = Array.isArray(input?.questionIds) ? [...new Set(input.questionIds.filter((id) => typeof id === 'string' && id.trim()))] : [];
    if (!title || title.length > 160) throw new BadRequestException('Enter an assessment title of 1 to 160 characters.');
    if (!affiliateIds.length) throw new BadRequestException('Select at least one affiliate.');
    if (!questionIds.length) throw new BadRequestException('Select at least one question.');
    let dueAt: Date | null = null;
    if (input?.dueAt) {
      dueAt = new Date(input.dueAt);
      if (Number.isNaN(dueAt.getTime())) throw new BadRequestException('Enter a valid assessment deadline.');
    }

    const [users, questions] = await Promise.all([
      Promise.all(affiliateIds.map((id) => this.usersService.findOne(id))),
      this.questionRepo.findBy({ id: In(questionIds) }),
    ]);
    const affiliateRoles = [UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT];
    if (users.some((user) => !affiliateRoles.includes(user.role))) throw new BadRequestException('Assessments can only be assigned to affiliate accounts.');
    if (questions.length !== questionIds.length) throw new BadRequestException('One or more selected questions no longer exist.');
    const byId = new Map(questions.map((question) => [question.id, question]));
    const questionSnapshot: AssessmentQuestionSnapshot[] = questionIds.map((id) => {
      const question = byId.get(id)!;
      return { id: question.id, text: question.text, type: question.type, options: question.options, correctOptionIndex: question.correctOptionIndex, weight: question.weight };
    });
    const assignments = affiliateIds.map((userId) => this.assignmentRepo.create({
      userId,
      assignedBy: adminId,
      title,
      instructions: typeof input.instructions === 'string' ? input.instructions.trim() || null : null,
      dueAt,
      questionSnapshot,
      status: 'assigned',
    }));
    return this.assignmentRepo.save(assignments);
  }

  async getAdminAssignments() {
    const assignments = await this.assignmentRepo.createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.user', 'user')
      .orderBy('assignment.createdAt', 'DESC')
      .take(300)
      .getMany();
    return assignments.map((assignment) => this.toAssignmentSummary(assignment, true));
  }

  async getUserAssignments(userId: string) {
    const assignments = await this.assignmentRepo.find({ where: { userId }, order: { createdAt: 'DESC' } });
    return assignments.map((assignment) => this.toAssignmentSummary(assignment));
  }

  async getUserAssignment(userId: string, assignmentId: string) {
    const assignment = await this.assignmentRepo.findOne({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assigned assessment not found.');
    if (assignment.userId !== userId) throw new ForbiddenException('This assessment is assigned to another affiliate.');
    if (assignment.status === 'assigned') {
      assignment.status = 'in_progress';
      await this.assignmentRepo.save(assignment);
    }
    return this.toAssignmentDetail(assignment);
  }

  async submitUserAssignment(userId: string, assignmentId: string, answers: { questionId: string; selectedOptionIndex: number }[]) {
    const assignment = await this.assignmentRepo.findOne({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assigned assessment not found.');
    if (assignment.userId !== userId) throw new ForbiddenException('This assessment is assigned to another affiliate.');
    if (!['assigned', 'in_progress'].includes(assignment.status)) throw new BadRequestException('This assessment has already been submitted.');
    if (!Array.isArray(answers) || answers.length !== assignment.questionSnapshot.length) throw new BadRequestException('Answer every question before submitting.');
    const answerMap = new Map<string, number>();
    for (const answer of answers) {
      if (!answer || typeof answer.questionId !== 'string' || !Number.isInteger(answer.selectedOptionIndex) || answer.selectedOptionIndex < -1 || answerMap.has(answer.questionId)) {
        throw new BadRequestException('The submitted answers are invalid.');
      }
      answerMap.set(answer.questionId, answer.selectedOptionIndex);
    }
    let score = 0;
    let maxScore = 0;
    for (const question of assignment.questionSnapshot) {
      const selected = answerMap.get(question.id);
      if (selected === undefined || selected >= question.options.length) throw new BadRequestException('The submitted answers are incomplete or invalid.');
      maxScore += question.weight;
      if (selected === question.correctOptionIndex) score += question.weight;
    }
    const percentage = maxScore ? Math.round(score / maxScore * 100) : 0;
    assignment.status = percentage >= 85 ? 'pass' : percentage >= 50 ? 'partial' : 'fail';
    assignment.score = score;
    assignment.maxScore = maxScore;
    assignment.percentage = percentage;
    assignment.answers = answers;
    assignment.submittedAt = new Date();
    await this.assignmentRepo.save(assignment);
    return { id: assignment.id, status: assignment.status, score, maxScore, percentage, submittedAt: assignment.submittedAt };
  }

  private toAssignmentSummary(assignment: AssessmentAssignment, includeAffiliate = false) {
    return {
      id: assignment.id,
      title: assignment.title,
      instructions: assignment.instructions,
      dueAt: assignment.dueAt,
      questionCount: assignment.questionSnapshot.length,
      status: assignment.status,
      score: assignment.score,
      maxScore: assignment.maxScore,
      percentage: assignment.percentage,
      submittedAt: assignment.submittedAt,
      createdAt: assignment.createdAt,
      ...(includeAffiliate ? { affiliate: assignment.user ? { id: assignment.user.id, email: assignment.user.email, name: `${assignment.user.firstName || ''} ${assignment.user.lastName || ''}`.trim() || assignment.user.email } : null } : {}),
    };
  }

  private toAssignmentDetail(assignment: AssessmentAssignment) {
    return {
      ...this.toAssignmentSummary(assignment),
      questions: assignment.questionSnapshot.map(({ id, text, type, options }) => ({ id, text, type, options })),
      result: assignment.submittedAt ? { answers: assignment.answers, score: assignment.score, maxScore: assignment.maxScore, percentage: assignment.percentage } : null,
    };
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

  async getLatestAttempt(userId?: string) {
    if (!userId) return null;
    const attempt = await this.attemptRepo.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!attempt) return null;

    // Keep submitted answers private; this endpoint is for the user's status view.
    return {
      id: attempt.id,
      score: attempt.score,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      band: attempt.band,
      createdAt: attempt.createdAt,
    };
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


