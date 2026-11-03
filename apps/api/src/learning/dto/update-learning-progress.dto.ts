import { IsEnum } from 'class-validator';
import { LearningProgressStatus } from '../entities/learning-progress.entity';

export class UpdateLearningProgressDto {
  @IsEnum(LearningProgressStatus)
  status: LearningProgressStatus;
}
