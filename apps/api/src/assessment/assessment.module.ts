import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { Question } from './entities/question.entity';
import { QuizAttempt } from './entities/quiz_attempt.entity';
import { Category } from '../categories/entities/category.entity';
import { Sector } from '../sectors/entities/sector.entity';
import { UsersModule } from '../users/users.module';
import { CategoriesModule } from '../categories/categories.module';
import { SectorsModule } from '../sectors/sectors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question, QuizAttempt, Category, Sector]),
    UsersModule,
    CategoriesModule,
    SectorsModule,
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService],
})
export class AssessmentModule {}
