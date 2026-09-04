import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountManagerController } from './account-manager.controller';
import { AccountManagerService } from './account-manager.service';
import { Task } from '../tasks/entities/task.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Transaction } from '../wallet/entities/transaction.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Wallet, Transaction, User])],
  controllers: [AccountManagerController],
  providers: [AccountManagerService],
  exports: [AccountManagerService],
})
export class AccountManagerModule {}