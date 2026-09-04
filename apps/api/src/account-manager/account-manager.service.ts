import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Transaction, TransactionType } from '../wallet/entities/transaction.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class AccountManagerService {
  constructor(
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async getRevenueDashboard(accountManagerId: string) {
    const managedAgents = await this.usersRepo.find({
      where: { role: UserRole.AGENT },
      select: ['id', 'firstName', 'lastName', 'email'],
    });

    const agentIds = managedAgents.map(a => a.id);

    const [totalRevenue, pendingRevenue, completedTasks, totalAgents] = await Promise.all([
      this.tasksRepo
        .createQueryBuilder('task')
        .where('task.assignedAgentId IN (:...agentIds)', { agentIds })
        .andWhere('task.status = :status', { status: TaskStatus.COMPLETED })
        .select('COALESCE(SUM(task.budget), 0)', 'sum')
        .getRawOne()
        .then(r => Number(r?.sum || 0)),

      this.tasksRepo
        .createQueryBuilder('task')
        .where('task.assignedAgentId IN (:...agentIds)', { agentIds })
        .andWhere('task.status IN (:...statuses)', { statuses: [TaskStatus.ACCEPTED, TaskStatus.SUBMITTED] })
        .select('COALESCE(SUM(task.budget), 0)', 'sum')
        .getRawOne()
        .then(r => Number(r?.sum || 0)),

      this.tasksRepo.count({
        where: { assignedAgentId: agentIds.length > 0 ? In(agentIds) : 'no-agents', status: TaskStatus.COMPLETED },
      }),

      Promise.resolve(managedAgents.length),
    ]);

    const recentTransactions = await this.transactionRepo
      .createQueryBuilder('tx')
      .innerJoin('tx.wallet', 'wallet')
      .where('wallet.userId IN (:...agentIds)', { agentIds })
      .orderBy('tx.createdAt', 'DESC')
      .take(10)
      .getMany();

    return {
      totalRevenue,
      pendingRevenue,
      completedTasks,
      totalAgents,
      recentTransactions,
      agents: managedAgents,
    };
  }
}