import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { UsersModule } from '../users/users.module';
import { AccountManagerModule } from '../account-manager/account-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    UsersModule,
    AccountManagerModule,
    HttpModule,
    ConfigModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
