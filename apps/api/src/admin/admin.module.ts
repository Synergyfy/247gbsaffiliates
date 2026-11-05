import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { QuizAttempt } from '../assessment/entities/quiz_attempt.entity';
import { LearningProgress } from '../learning/entities/learning-progress.entity';
import { LearningResource } from '../learning/entities/learning-resource.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, QuizAttempt, LearningProgress, LearningResource])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
