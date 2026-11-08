import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from '../users/users.module';
import { Task } from '../tasks/entities/task.entity';
import { BusinessProspect } from './entities/business-prospect.entity';
import { BusinessRelationshipHistory } from './entities/business-relationship-history.entity';
import { BusinessAcquisitionSettings } from './entities/business-acquisition-settings.entity';
import { BusinessAcquisitionEvent } from './entities/business-acquisition-event.entity';
import { BusinessAcquisitionService } from './business-acquisition.service';
import { BusinessAcquisitionEventsService } from './business-acquisition-events.service';
import { BusinessAcquisitionController } from './business-acquisition.controller';
import { BusinessAcquisitionInternalController } from './business-acquisition-internal.controller';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessProspect,
      BusinessRelationshipHistory,
      BusinessAcquisitionSettings,
      BusinessAcquisitionEvent,
      Task,
    ]),
    UsersModule,
    HttpModule,
  ],
  controllers: [BusinessAcquisitionController, BusinessAcquisitionInternalController],
  providers: [BusinessAcquisitionService, BusinessAcquisitionEventsService, ApiKeyGuard],
  exports: [BusinessAcquisitionService],
})
export class BusinessAcquisitionModule {}
