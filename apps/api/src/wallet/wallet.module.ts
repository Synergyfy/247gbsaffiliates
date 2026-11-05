import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { McomWalletService } from './mcom-wallet.service';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Wallet, Transaction, User])],
  controllers: [WalletController],
  providers: [WalletService, McomWalletService],
  exports: [WalletService, McomWalletService],
})
export class WalletModule {}
