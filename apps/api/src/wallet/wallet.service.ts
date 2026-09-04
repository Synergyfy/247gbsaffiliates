import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
  ) {}

  async findOneByUserId(userId: string) {
    let wallet = await this.walletRepo.findOne({ where: { userId } });
    if (!wallet) {
      wallet = this.walletRepo.create({ userId, balance: 0 });
      await this.walletRepo.save(wallet);
    }
    return wallet;
  }

  async deposit(userId: string, amount: number, description?: string) {
    const wallet = await this.findOneByUserId(userId);
    wallet.balance = Number(wallet.balance) + Number(amount);
    
    await this.walletRepo.save(wallet);

    const transaction = this.transactionRepo.create({
      walletId: wallet.id,
      type: TransactionType.DEPOSIT,
      amount,
      description: description || 'Deposit',
    });
    
    await this.transactionRepo.save(transaction);
    return wallet;
  }

  async getTransactions(userId: string) {
    const wallet = await this.findOneByUserId(userId);
    return this.transactionRepo.find({
      where: { walletId: wallet.id },
      order: { createdAt: 'DESC' },
    });
  }
}

