import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { VerificationRequest } from '../verification/entities/verification_request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, Wallet, VerificationRequest])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}