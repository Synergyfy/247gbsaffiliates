import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';
import { LearningResource } from './entities/learning-resource.entity';
import { Category } from '../categories/entities/category.entity';
import { LearningProgress } from './entities/learning-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LearningResource, LearningProgress, Category])],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
