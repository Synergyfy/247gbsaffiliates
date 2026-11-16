import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { VerificationStatus } from '../users/entities/user.entity';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

const mockTask: {
  id: string;
  title: string;
  status: TaskStatus;
  assignedAgentId: string | null;
  externalTaskId?: string | null;
  submissionData?: Record<string, any> | null;
  reviewHistory?: Array<Record<string, any>> | null;
  reviewNotes?: string | null;
  revisionCount?: number;
  submittedAt?: Date | null;
  reviewedAt?: Date | null;
  completedAt?: Date | null;
  assigneeEmail?: string | null;
  paymentStatus?: string | null;
  chargeApprovalRequired?: boolean;
} = {
  id: 'uuid-task-1',
  title: 'Affiliate Task',
  status: TaskStatus.OPEN,
  assignedAgentId: null,
};

const mockUser = {
  id: 'uuid-agent-1',
  role: UserRole.AGENT,
  verificationStatus: VerificationStatus.VERIFIED,
  isOnboarded: true,
  isQuizPassed: true,
  skills: ['Lead generation'],
};

const mockAdmin = {
  id: 'uuid-admin-1',
  role: UserRole.ADMIN,
};

const mockRepo = {
  create: jest.fn().mockImplementation((dto) => ({ ...dto, id: 'uuid-new', status: TaskStatus.OPEN })),
  save: jest.fn().mockImplementation((task) => Promise.resolve({ ...mockTask, ...task })),
  findAndCount: jest.fn().mockResolvedValue([[mockTask], 1]),
  findOne: jest.fn().mockImplementation(({ where }) => {
    const clauses = Array.isArray(where) ? where : [where ?? {}];
    for (const clause of clauses) {
      if (
        clause?.externalTaskId &&
        clause.externalTaskId === mockTask.externalTaskId
      ) {
        return Promise.resolve({ ...mockTask });
      }
      if (clause?.id === 'uuid-task-1') {
        // Account-manager scope lookup fetches by id, then checks ownership.
        if (Object.keys(clause).length === 1) {
          return Promise.resolve({ ...mockTask });
        }
        // The open-pool clause uses `status: OPEN` + `assignedAgentId: IsNull()`.
        if (
          clause.status === TaskStatus.OPEN &&
          mockTask.status === TaskStatus.OPEN
        ) {
          return Promise.resolve({ ...mockTask });
        }
        if (clause.assignedAgentId === mockTask.assignedAgentId) {
          return Promise.resolve({ ...mockTask });
        }
      }
    }
    return Promise.resolve(null);
  }),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(null),
  })),
};

const mockUsersService = {
  findOne: jest.fn().mockImplementation((id) => {
    if (id === 'uuid-agent-1') return Promise.resolve(mockUser);
    if (id === 'uuid-admin-1') return Promise.resolve(mockAdmin);
    return Promise.resolve(null);
  }),
};

import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AccountManagerService } from '../account-manager/account-manager.service';
import { of } from 'rxjs';

const mockHttpService = {
  patch: jest.fn().mockReturnValue(of({ data: {} })),
  post: jest.fn().mockReturnValue(of({ data: {} })),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('http://localhost:3010/api/v1'),
};

const mockAccountManagerService = {
  canManageTask: jest.fn().mockResolvedValue(false),
  createManagedProjectTask: jest.fn().mockResolvedValue({
    success: true,
    data: {
      id: 'central-task-1',
      businessId: 'central-business-1',
      projectId: 'central-project-1',
      status: 'PENDING_ASSIGNMENT',
      title: 'Design Flyer',
      description: 'Create the campaign flyer.',
      business: { id: 'central-business-1', businessName: 'Acme Ltd' },
      project: { id: 'central-project-1', title: 'Abuja Campaign' },
    },
  }),
};

describe('TasksService (AffiliateBackend)', () => {
  let service: TasksService;

  beforeEach(async () => {
    mockTask.status = TaskStatus.OPEN;
    mockTask.assignedAgentId = null;
    mockTask.externalTaskId = undefined;
    mockTask.submissionData = null;
    mockTask.reviewHistory = null;
    mockTask.reviewNotes = null;
    mockTask.revisionCount = 0;
    mockTask.submittedAt = null;
    mockTask.reviewedAt = null;
    mockTask.completedAt = null;
    mockTask.paymentStatus = null;
    mockTask.chargeApprovalRequired = false;
    mockRepo.findAndCount.mockClear();
    mockRepo.findOne.mockClear();
    mockRepo.save.mockClear();
    mockRepo.create.mockClear();
    mockRepo.createQueryBuilder.mockClear();
    mockUsersService.findOne.mockClear();
    mockAccountManagerService.canManageTask.mockClear();
    mockAccountManagerService.canManageTask.mockResolvedValue(false);
    mockAccountManagerService.createManagedProjectTask.mockClear();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockRepo },
        { provide: UsersService, useValue: mockUsersService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AccountManagerService, useValue: mockAccountManagerService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('prevents local assignment of a Central-linked task', async () => {
    mockTask.externalTaskId = 'central-task-1';

    await expect(service.assign('uuid-task-1', 'uuid-agent-1')).rejects.toMatchObject({
      response: { code: 'CENTRAL_TASK_ASSIGNMENT_REQUIRED' },
    });
  });

  it('creates client project tasks in Central Hub and stores the linked mirror', async () => {
    const result = (await service.create('uuid-admin-1', {
      title: 'Design Flyer',
      description: 'Create the campaign flyer.',
      budget: 100,
      centralProjectId: 'central-project-1',
    } as any)) as Task;

    expect(mockAccountManagerService.createManagedProjectTask).toHaveBeenCalledWith(
      'uuid-admin-1',
      'central-project-1',
      expect.objectContaining({
        title: 'Design Flyer',
        description: 'Create the campaign flyer.',
      }),
    );
    expect(result.externalTaskId).toBe('central-task-1');
    expect(result.centralBusinessId).toBe('central-business-1');
    expect(result.projectId).toBe('central-project-1');
    expect(result.originSystem).toBe('MCOM_CENTRAL');
  });

  it('should create task from central', async () => {
    const dto = {
      externalTaskId: 'ext-1',
      originSystem: 'MCOM_MALL' as any,
      originRequesterId: 'req-1',
      title: 'Synced Task',
      description: 'Desc',
    };
    const result = (await service.createFromCentral(dto)) as Task;
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ externalTaskId: 'ext-1' }));
    expect(result.status).toBe(TaskStatus.OPEN);
  });

  it('scopes an affiliate assigned-task query to the authenticated affiliate', async () => {
    mockTask.assignedAgentId = 'uuid-agent-1';
    await service.findAll({ assignedAgentId: 'uuid-other-agent' }, 'uuid-agent-1', UserRole.AGENT);

    expect(mockRepo.findAndCount).toHaveBeenLastCalledWith(expect.objectContaining({
      where: expect.arrayContaining([
        expect.objectContaining({ assignedAgentId: 'uuid-agent-1' }),
      ]),
      relations: [],
    }));
  });

  it('does not return other affiliates’ assigned tasks from an unfiltered affiliate list request', async () => {
    await service.findAll({}, 'uuid-agent-1', UserRole.AGENT);

    expect(mockRepo.findAndCount).toHaveBeenLastCalledWith(expect.objectContaining({
      where: expect.arrayContaining([
        expect.objectContaining({ assignedAgentId: 'uuid-agent-1' }),
        expect.objectContaining({ status: TaskStatus.OPEN, assignedAgentId: null }),
      ]),
    }));
  });

  it('applies affiliate ownership rules to account managers and consultants too', async () => {
    await service.findAll({ status: TaskStatus.ASSIGNED, assignedAgentId: 'uuid-other-agent' }, 'uuid-agent-1', UserRole.ACCOUNT_MANAGER);

    expect(mockRepo.findAndCount).toHaveBeenLastCalledWith(expect.objectContaining({
      where: [{ status: TaskStatus.ASSIGNED, assignedAgentId: 'uuid-agent-1' }],
      relations: [],
    }));
  });

  it('returns an empty work list (not a 403) when an affiliate is not yet qualified', async () => {
    mockUsersService.findOne.mockResolvedValueOnce({ ...mockUser, isQuizPassed: false });

    await expect(service.findAll({}, 'uuid-agent-1', UserRole.AGENT)).resolves.toEqual({
      items: [],
      meta: { total: 0, page: 1, lastPage: 0 },
    });
    expect(mockRepo.findAndCount).not.toHaveBeenCalled();
  });

  it('allows a qualified affiliate to open an unassigned open task', async () => {
    mockTask.assignedAgentId = null;
    mockTask.status = TaskStatus.OPEN;

    const result = await service.findOneForUser(
      'uuid-task-1',
      'uuid-agent-1',
      UserRole.AGENT,
    );

    expect(result.id).toBe('uuid-task-1');
  });

  it('hides an assigned task from an affiliate it is not assigned to', async () => {
    mockTask.assignedAgentId = 'uuid-other-agent';
    mockTask.status = TaskStatus.ASSIGNED;

    await expect(service.findOneForUser('uuid-task-1', 'uuid-agent-1', UserRole.AGENT))
      .rejects.toThrow(NotFoundException);
  });

  it('allows the assigned affiliate to access task attachments', async () => {
    mockTask.assignedAgentId = 'uuid-agent-1';
    mockTask.status = TaskStatus.ACCEPTED;

    await expect(
      service.findOneForAttachment(
        'uuid-task-1',
        'uuid-agent-1',
        UserRole.AGENT,
      ),
    ).resolves.toMatchObject({ id: 'uuid-task-1' });
  });

  it('does not expose attachments from an open task to the open pool', async () => {
    mockTask.assignedAgentId = null;
    mockTask.status = TaskStatus.OPEN;

    await expect(
      service.findOneForAttachment(
        'uuid-task-1',
        'uuid-agent-1',
        UserRole.AGENT,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('allows an account manager to open a task in their managed scope', async () => {
    mockTask.assignedAgentId = 'uuid-other-agent';
    mockTask.status = TaskStatus.ASSIGNED;
    mockAccountManagerService.canManageTask.mockResolvedValue(true);

    const result = await service.findOneForUser(
      'uuid-task-1',
      'uuid-agent-1',
      UserRole.ACCOUNT_MANAGER,
    );

    expect(result.id).toBe('uuid-task-1');
    expect(mockAccountManagerService.canManageTask).toHaveBeenCalledWith(
      'uuid-agent-1',
      expect.objectContaining({ id: 'uuid-task-1' }),
    );
  });

  it('hides a task outside an account manager’s managed scope', async () => {
    mockTask.assignedAgentId = 'uuid-other-agent';
    mockTask.status = TaskStatus.ASSIGNED;

    await expect(
      service.findOneForUser('uuid-task-1', 'uuid-agent-1', UserRole.ACCOUNT_MANAGER),
    ).rejects.toThrow(NotFoundException);
  });

  it('should assign task to agent', async () => {
    const result = await service.assign('uuid-task-1', 'uuid-agent-1');
    expect(result.status).toBe(TaskStatus.ASSIGNED);
    expect(result.assignedAgentId).toBe('uuid-agent-1');
  });

  it('should forbid assigning task to admin', async () => {
    await expect(service.assign('uuid-task-1', 'uuid-admin-1')).rejects.toThrow(ForbiddenException);
  });

  it('should respond to task (accept)', async () => {
    // Setup task as assigned
    mockTask.status = TaskStatus.ASSIGNED;
    mockTask.assignedAgentId = 'uuid-agent-1';
    
    const result = await service.respondToTask('uuid-task-1', 'uuid-agent-1', 'accept');
    expect(result.status).toBe(TaskStatus.ACCEPTED);
  });

  it('blocks accepting while Central has not locked the business funds', async () => {
    mockTask.status = TaskStatus.ASSIGNED;
    mockTask.assignedAgentId = 'uuid-agent-1';
    mockTask.paymentStatus = 'ON_HOLD';

    await expect(service.respondToTask('uuid-task-1', 'uuid-agent-1', 'accept'))
      .rejects.toThrow(BadRequestException);
  });

  it('should not allow an unverified affiliate to accept an assigned task', async () => {
    mockTask.status = TaskStatus.ASSIGNED;
    mockTask.assignedAgentId = 'uuid-agent-1';
    mockUsersService.findOne.mockResolvedValueOnce({
      ...mockUser,
      verificationStatus: VerificationStatus.PENDING,
      isOnboarded: false,
    });

    await expect(service.respondToTask('uuid-task-1', 'uuid-agent-1', 'accept'))
      .rejects.toThrow(ForbiddenException);
  });

  it('allows a qualified assigned affiliate to submit an accepted task for review', async () => {
    mockTask.status = TaskStatus.ACCEPTED;
    mockTask.assignedAgentId = 'uuid-agent-1';

    const result = await service.updateStatus('uuid-task-1', TaskStatus.SUBMITTED, 'uuid-agent-1');

    expect(result.status).toBe(TaskStatus.SUBMITTED);
  });

  it('does not allow an affiliate to skip review by setting completed directly', async () => {
    mockTask.status = TaskStatus.ACCEPTED;
    mockTask.assignedAgentId = 'uuid-agent-1';

    await expect(service.updateStatus('uuid-task-1', TaskStatus.COMPLETED, 'uuid-agent-1'))
      .rejects.toThrow(BadRequestException);
  });

  it('stores notes, links and attachments when submitting for review', async () => {
    mockTask.status = TaskStatus.ACCEPTED;
    mockTask.assignedAgentId = 'uuid-agent-1';

    const result = await service.submit('uuid-task-1', 'uuid-agent-1', {
      notes: 'Uploaded the first 20 products.',
      links: ['https://store.example.com/widget'],
      attachments: [{ url: 'https://cdn.example.com/proof.png', fileName: 'proof.png', kind: 'IMAGE' }],
    });

    expect(result.status).toBe(TaskStatus.SUBMITTED);
    expect(result.submittedAt).toBeInstanceOf(Date);
    expect(result.submissionData).toMatchObject({
      notes: 'Uploaded the first 20 products.',
      links: ['https://store.example.com/widget'],
      attachments: [{ url: 'https://cdn.example.com/proof.png', fileName: 'proof.png', kind: 'IMAGE' }],
    });
  });

  it('acknowledges a changes-requested review and returns the task to accepted', async () => {
    mockTask.status = TaskStatus.REVISION_REQUESTED;
    mockTask.assignedAgentId = 'uuid-agent-1';
    mockTask.reviewHistory = [
      { round: 1, decision: 'CHANGES_REQUESTED', notes: 'Fix the banner', reviewedAt: new Date().toISOString(), acknowledgedAt: null },
    ];

    const result = await service.acknowledgeReview('uuid-task-1', 'uuid-agent-1');

    expect(result.status).toBe(TaskStatus.ACCEPTED);
    expect(result.reviewHistory?.[0]?.acknowledgedAt).toBeTruthy();
  });

  it('applies a Central changes-requested outcome and an approval', async () => {
    mockTask.status = TaskStatus.SUBMITTED;
    mockTask.externalTaskId = 'ext-review-1';
    mockTask.reviewHistory = [];
    mockTask.revisionCount = 0;

    const changes = await service.applyReviewFromCentral('ext-review-1', {
      decision: 'CHANGES_REQUESTED',
      notes: 'Please add the banner to the homepage.',
      round: 1,
    });
    expect(changes.status).toBe(TaskStatus.REVISION_REQUESTED);
    expect(changes.reviewNotes).toBe('Please add the banner to the homepage.');
    expect(changes.revisionCount).toBe(1);
    expect(changes.reviewHistory).toHaveLength(1);

    const approved = await service.applyReviewFromCentral('ext-review-1', {
      decision: 'APPROVED',
      notes: 'Looks good.',
      round: 2,
    });
    expect(approved.status).toBe(TaskStatus.COMPLETED);
    expect(approved.completedAt).toBeInstanceOf(Date);
  });

  it('should respond to task (decline)', async () => {
    mockTask.status = TaskStatus.ASSIGNED;
    mockTask.assignedAgentId = 'uuid-agent-1';

    const result = await service.respondToTask('uuid-task-1', 'uuid-agent-1', 'decline', {
      reason: 'No capacity before the deadline.',
    });
    expect(result.status).toBe(TaskStatus.DECLINED);
    expect(result.declineReason).toBe('No capacity before the deadline.');
  });

  it('refuses a decline without a reason', async () => {
    mockTask.status = TaskStatus.ASSIGNED;
    mockTask.assignedAgentId = 'uuid-agent-1';

    await expect(
      service.respondToTask('uuid-task-1', 'uuid-agent-1', 'decline', { reason: '  ' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
