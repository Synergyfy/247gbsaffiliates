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

    const questions = await qb.orderBy('RANDOM()').limit(10).getMany();

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

     const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
     let band = 'Fail';
     if (percentage >= 85) band = 'Pass';
     else if (percentage >= 50) band = 'Partial';

     if (band === 'Pass') {
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
      // Keep existing seed logic or empty it
  }
}


