import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { User, UserRole, UserStatus, VerificationStatus } from '../users/entities/user.entity';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { QuizAttempt } from '../assessment/entities/quiz_attempt.entity';
import { LearningProgress, LearningProgressStatus } from '../learning/entities/learning-progress.entity';
import { LearningResource } from '../learning/entities/learning-resource.entity';

interface UserFilters {
  page: number;
  limit: number;
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  verificationStatus?: VerificationStatus;
  isOnboarded?: boolean;
  isQuizPassed?: boolean;
  qualification?: 'qualified' | 'incomplete';
}

const AFFILIATE_ROLES = [UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT];

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,
    @InjectRepository(QuizAttempt)
    private attemptRepo: Repository<QuizAttempt>,
    @InjectRepository(LearningProgress)
    private learningProgressRepo: Repository<LearningProgress>,
    @InjectRepository(LearningResource)
    private learningResourceRepo: Repository<LearningResource>,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalAffiliates,
      pendingAffiliateVerification,
      verifiedAffiliates,
      qualifiedAffiliates,
      passedAssessments,
      failedAssessments,
      usersByRole,
      tasksByStatus,
      assignedTasks,
      completedTasks,
      recentUsers,
    ] = await Promise.all([
      this.usersRepo.count(),
      this.usersRepo.count({ where: { role: In(AFFILIATE_ROLES) } }),
      this.usersRepo.count({ where: { role: In(AFFILIATE_ROLES), verificationStatus: VerificationStatus.PENDING } }),
      this.usersRepo.count({ where: { role: In(AFFILIATE_ROLES), verificationStatus: VerificationStatus.VERIFIED } }),
      this.usersRepo.createQueryBuilder('user')
        .where('user.role IN (:...roles)', { roles: AFFILIATE_ROLES })
        .andWhere("user.verificationStatus = :verified AND user.isOnboarded = true AND user.isQuizPassed = true AND COALESCE(user.skills, '') <> ''", { verified: VerificationStatus.VERIFIED })
        .getCount(),
      this.attemptRepo.count({ where: { band: In(['Pass', 'Partial']) } }),
      this.attemptRepo.count({ where: { band: 'Fail' } }),
      this.usersRepo
        .createQueryBuilder('user')
        .select('user.role', 'role')
        .addSelect('COUNT(*)', 'count')
        .groupBy('user.role')
        .getRawMany(),
      this.tasksRepo
        .createQueryBuilder('task')
        .select('task.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('task.status')
        .getRawMany(),
      this.tasksRepo.count({ where: { status: In([TaskStatus.ASSIGNED, TaskStatus.ACCEPTED, TaskStatus.SUBMITTED]) } }),
      this.tasksRepo.count({ where: { status: TaskStatus.COMPLETED } }),
      this.usersRepo.createQueryBuilder('user')
        .select(['user.id', 'user.email', 'user.firstName', 'user.lastName', 'user.role', 'user.status', 'user.verificationStatus', 'user.isOnboarded', 'user.isQuizPassed', 'user.skills', 'user.createdAt'])
        .where('user.role IN (:...roles)', { roles: AFFILIATE_ROLES })
        .orderBy('user.createdAt', 'DESC')
        .take(8)
        .getMany(),
    ]);

    const attemptsByBand = await this.attemptRepo.createQueryBuilder('attempt')
      .select('attempt.band', 'band')
      .addSelect('COUNT(*)', 'count')
      .groupBy('attempt.band')
      .getRawMany();

    return {
      totalUsers,
      totalAffiliates,
      pendingAffiliateVerification,
      verifiedAffiliates,
      qualifiedAffiliates,
      passedAssessments,
      failedAssessments,
      attemptsByBand: attemptsByBand.reduce((acc, row) => ({ ...acc, [row.band]: Number(row.count) }), {}),
      usersByRole: usersByRole.reduce((acc, r) => ({ ...acc, [r.role]: Number(r.count) }), {}),
      tasksByStatus: tasksByStatus.reduce((acc, r) => ({ ...acc, [r.status]: Number(r.count) }), {}),
      assignedTasks,
      completedTasks,
      recentUsers: await this.withLearningSummaries(recentUsers),
    };
  }

  async getUsers(filters: UserFilters) {
    const { page, limit, role, status, search, verificationStatus, isOnboarded, isQuizPassed, qualification } = filters;
    const skip = (page - 1) * limit;

    const qb = this.usersRepo.createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.firstName', 'user.lastName', 'user.role', 'user.status', 'user.verificationStatus', 'user.verificationNotes', 'user.verificationReviewedAt', 'user.isOnboarded', 'user.isQuizPassed', 'user.skills', 'user.sectorId', 'user.categoryId', 'user.subCategoryId', 'user.createdAt', 'user.updatedAt'])
      .where('user.role IN (:...affiliateRoles)', { affiliateRoles: AFFILIATE_ROLES });

    if (role) qb.andWhere('user.role = :role', { role });
    if (status) qb.andWhere('user.status = :status', { status });
    if (verificationStatus) qb.andWhere('user.verificationStatus = :verificationStatus', { verificationStatus });
    if (isOnboarded !== undefined) qb.andWhere('user.isOnboarded = :isOnboarded', { isOnboarded });
    if (isQuizPassed !== undefined) qb.andWhere('user.isQuizPassed = :isQuizPassed', { isQuizPassed });
    if (qualification === 'qualified') {
      qb.andWhere("user.verificationStatus = :qualifiedVerification AND user.isOnboarded = true AND user.isQuizPassed = true AND COALESCE(user.skills, '') <> ''", { qualifiedVerification: VerificationStatus.VERIFIED });
    } else if (qualification === 'incomplete') {
      qb.andWhere("(user.verificationStatus <> :incompleteVerification OR user.isOnboarded = false OR user.isQuizPassed = false OR COALESCE(user.skills, '') = '')", { incompleteVerification: VerificationStatus.VERIFIED });
    }
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
      items: await this.withLearningSummaries(items),
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }

  async getAffiliateDetails(id: string) {
    const user = await this.usersRepo.createQueryBuilder('user')
      .select(['user.id', 'user.email', 'user.firstName', 'user.lastName', 'user.role', 'user.status', 'user.verificationStatus', 'user.verificationNotes', 'user.verificationReviewedAt', 'user.verificationSubmission', 'user.verificationDocumentName', 'user.verificationDocumentMimeType', 'user.isOnboarded', 'user.isQuizPassed', 'user.skills', 'user.bio', 'user.profileImage', 'user.sectorId', 'user.categoryId', 'user.subCategoryId', 'user.hourlyRate', 'user.currency', 'user.timezone', 'user.languages', 'user.portfolioUrl', 'user.createdAt', 'user.updatedAt'])
      .where('user.id = :id AND user.role IN (:...roles)', { id, roles: AFFILIATE_ROLES })
      .getOne();
    if (!user) throw new NotFoundException('Affiliate not found.');

    const attempts = await this.attemptRepo.find({ where: { userId: id }, order: { createdAt: 'DESC' }, take: 10 });
    const qualified = user.verificationStatus === VerificationStatus.VERIFIED && user.isOnboarded && user.isQuizPassed && Boolean(user.skills?.length);
    const learningSummary = await this.getLearningSummary(user.id, user.role);
    return {
      ...this.toAdminUserSummary(user),
      profile: {
        bio: user.bio,
        profileImage: user.profileImage,
        sectorId: user.sectorId,
        categoryId: user.categoryId,
        subCategoryId: user.subCategoryId,
        hourlyRate: user.hourlyRate,
        currency: user.currency,
        timezone: user.timezone,
        languages: user.languages,
        portfolioUrl: user.portfolioUrl,
        verificationSubmission: user.verificationSubmission,
        verificationDocumentName: user.verificationDocumentName,
        verificationDocumentMimeType: user.verificationDocumentMimeType,
      },
      assessmentAttempts: attempts.map(({ id: attemptId, score, maxScore, percentage, band, answers, createdAt }) => ({ id: attemptId, score, maxScore, percentage, band, answers, createdAt })),
      qualificationStatus: qualified ? 'qualified' : 'incomplete',
      ...learningSummary,
    };
  }

  private async withLearningSummaries(users: User[]) {
    const learningByUser = await this.getLearningSummaries(users);
    return users.map((user) => ({
      ...this.toAdminUserSummary(user),
      ...(learningByUser.get(user.id) ?? { learningStatus: 'not_started', learningCompletedCount: 0, learningResourceCount: 0 }),
    }));
  }

  private async getLearningSummaries(users: User[]) {
    const summaries = new Map<string, { learningStatus: string; learningCompletedCount: number; learningResourceCount: number }>();
    if (!users.length) return summaries;

    const [resources, progressRows] = await Promise.all([
      this.learningResourceRepo.find({ where: { isPublished: true } }),
      this.learningProgressRepo.find({ where: { userId: In(users.map((user) => user.id)) } }),
    ]);
    const progressByUser = new Map<string, LearningProgress[]>();
    for (const progress of progressRows) {
      const list = progressByUser.get(progress.userId) ?? [];
      list.push(progress);
      progressByUser.set(progress.userId, list);
    }

    for (const user of users) {
      const applicableResources = resources.filter((resource) => !resource.targetRoles?.length || resource.targetRoles.includes(user.role));
      const applicableIds = new Set(applicableResources.map((resource) => resource.id));
      const userProgress = (progressByUser.get(user.id) ?? []).filter((progress) => applicableIds.has(progress.resourceId));
      const completedCount = userProgress.filter((progress) => progress.status === LearningProgressStatus.COMPLETED).length;
      const status = applicableResources.length > 0 && completedCount === applicableResources.length
        ? 'completed'
        : userProgress.length > 0
          ? 'in_progress'
          : 'not_started';
      summaries.set(user.id, {
        learningStatus: status,
        learningCompletedCount: completedCount,
        learningResourceCount: applicableResources.length,
      });
    }
    return summaries;
  }

  private async getLearningSummary(userId: string, role: UserRole) {
    const user = { id: userId, role } as User;
    return (await this.getLearningSummaries([user])).get(userId) ?? {
      learningStatus: 'not_started', learningCompletedCount: 0, learningResourceCount: 0,
    };
  }

  private toAdminUserSummary(user: User) {
    const qualified = user.verificationStatus === VerificationStatus.VERIFIED && user.isOnboarded && user.isQuizPassed && Boolean(user.skills?.length);
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    return {
      id: user.id,
      email: user.email,
      name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      verificationStatus: user.verificationStatus,
      verificationNotes: user.verificationNotes,
      verificationReviewedAt: user.verificationReviewedAt,
      isOnboarded: user.isOnboarded,
      isQuizPassed: user.isQuizPassed,
      skills: user.skills,
      sectorId: user.sectorId,
      categoryId: user.categoryId,
      subCategoryId: user.subCategoryId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      qualificationStatus: qualified ? 'qualified' : 'incomplete',
    };
  }

  async updateUserStatus(id: string, status: UserStatus) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user || !AFFILIATE_ROLES.includes(user.role)) throw new NotFoundException('Affiliate not found.');
    user.status = status;
    const saved = await this.usersRepo.save(user);
    return { ...this.toAdminUserSummary(saved), ...(await this.getLearningSummary(saved.id, saved.role)) };
  }

  async getVerificationQueue() {
    const users = await this.usersRepo.createQueryBuilder('user')
      .select([
        'user.id', 'user.email', 'user.firstName', 'user.lastName', 'user.role',
        'user.skills', 'user.isQuizPassed', 'user.isOnboarded', 'user.verificationStatus',
        'user.verificationNotes', 'user.verificationReviewedAt', 'user.verificationSubmission',
        'user.verificationDocumentName', 'user.verificationDocumentMimeType', 'user.updatedAt',
      ])
      .where('user.role IN (:...roles)', { roles: [UserRole.AGENT, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT] })
      .andWhere('user.verificationStatus IN (:...statuses)', {
        statuses: [VerificationStatus.UNVERIFIED, VerificationStatus.PENDING, VerificationStatus.REJECTED],
      })
      .orderBy('user.updatedAt', 'DESC')
      .getMany();

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      skills: user.skills,
      isQuizPassed: user.isQuizPassed,
      isOnboarded: user.isOnboarded,
      verificationStatus: user.verificationStatus,
      verificationNotes: user.verificationNotes,
      verificationReviewedAt: user.verificationReviewedAt,
      verificationSubmission: user.verificationSubmission,
      verificationDocumentName: user.verificationDocumentName,
      verificationDocumentMimeType: user.verificationDocumentMimeType,
      submitted: Boolean(user.verificationSubmission && user.verificationDocumentMimeType),
      updatedAt: user.updatedAt,
    }));
  }

  async getVerificationDocument(id: string) {
    const user = await this.usersRepo.createQueryBuilder('user')
      .addSelect('user.verificationDocument')
      .where('user.id = :id', { id })
      .getOne();
    if (!user || !user.verificationDocument || !user.verificationDocumentMimeType) {
      throw new NotFoundException('No identity document was submitted for this account.');
    }
    return {
      data: user.verificationDocument,
      mimeType: user.verificationDocumentMimeType,
      name: user.verificationDocumentName || 'identity-document',
    };
  }

  async reviewVerification(id: string, status: VerificationStatus, notes?: string) {
    if (![VerificationStatus.VERIFIED, VerificationStatus.REJECTED].includes(status)) {
      throw new BadRequestException('Admin decisions must be Verified or Rejected.');
    }
    const reason = notes?.trim() || '';
    if (status === VerificationStatus.REJECTED && !reason) {
      throw new BadRequestException('Provide a rejection reason for the affiliate.');
    }

    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user || user.role === UserRole.ADMIN) throw new NotFoundException('Affiliate account not found.');
    if (status === VerificationStatus.VERIFIED && (!user.verificationSubmission || !user.verificationDocumentMimeType)) {
      throw new ForbiddenException('The affiliate must submit profile information and an identity document before approval.');
    }

    user.verificationStatus = status;
    user.verificationNotes = status === VerificationStatus.REJECTED ? reason.slice(0, 2000) : null;
    user.verificationReviewedAt = new Date();

    if (status === VerificationStatus.REJECTED) {
      user.isOnboarded = false;
    } else if (user.isQuizPassed && user.skills?.length) {
      user.isOnboarded = true;
    }

    const saved = await this.usersRepo.save(user);
    return {
      id: saved.id,
      verificationStatus: saved.verificationStatus,
      verificationNotes: saved.verificationNotes,
      verificationReviewedAt: saved.verificationReviewedAt,
      isOnboarded: saved.isOnboarded,
    };
  }
}
