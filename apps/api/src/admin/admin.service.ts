import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { VerificationRequest, RequestStatus, VerificationType } from '../verification/entities/verification_request.entity';

interface UserFilters {
  page: number;
  limit: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,
    @InjectRepository(Wallet)
    private walletRepo: Repository<Wallet>,
    @InjectRepository(VerificationRequest)
    private verificationRepo: Repository<VerificationRequest>,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      usersByRole,
      totalTasks,
      tasksByStatus,
      totalRevenue,
      pendingVerifications,
      totalWalletBalance,
    ] = await Promise.all([
      this.usersRepo.count(),
      this.usersRepo
        .createQueryBuilder('user')
        .select('user.role', 'role')
        .addSelect('COUNT(*)', 'count')
        .groupBy('user.role')
        .getRawMany(),
      this.tasksRepo.count(),
      this.tasksRepo
        .createQueryBuilder('task')
        .select('task.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('task.status')
        .getRawMany(),
      this.tasksRepo
        .createQueryBuilder('task')
        .where('task.status = :status', { status: TaskStatus.COMPLETED })
        .select('COALESCE(SUM(task.budget), 0)', 'sum')
        .getRawOne()
        .then(r => Number(r?.sum || 0)),
      this.verificationRepo.count({ where: { status: RequestStatus.PENDING } }),
      this.walletRepo
        .createQueryBuilder('wallet')
        .select('COALESCE(SUM(wallet.balance), 0)', 'sum')
        .getRawOne()
        .then(r => Number(r?.sum || 0)),
    ]);

    return {
      totalUsers,
      usersByRole: usersByRole.reduce((acc, r) => ({ ...acc, [r.role]: Number(r.count) }), {}),
      totalTasks,
      tasksByStatus: tasksByStatus.reduce((acc, r) => ({ ...acc, [r.status]: Number(r.count) }), {}),
      totalRevenue,
      pendingVerifications,
      totalWalletBalance,
    };
  }

  async getUsers(filters: UserFilters) {
    const { page, limit, role, status, search } = filters;
    const skip = (page - 1) * limit;

    const qb = this.usersRepo.createQueryBuilder('user');

    if (role) qb.andWhere('user.role = :role', { role });
    if (status) qb.andWhere('user.status = :status', { status });
    if (search) {
      qb.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }

  async updateUserStatus(id: string, status: UserStatus) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    user.status = status;
    return this.usersRepo.save(user);
  }
}