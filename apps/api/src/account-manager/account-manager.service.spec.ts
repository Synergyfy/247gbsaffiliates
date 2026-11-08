import { BadRequestException, ConflictException } from '@nestjs/common';
import { AccountManagerService } from './account-manager.service';
import { UserRole, UserStatus, VerificationStatus } from '../users/entities/user.entity';

function buildHarness() {
  const workloadQuery = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
  };
  const tasksRepo = {
    createQueryBuilder: jest.fn().mockReturnValue(workloadQuery),
  };
  const usersRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const quizAttemptRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  const service = new AccountManagerService(
    tasksRepo as never,
    {} as never,
    {} as never,
    usersRepo as never,
    quizAttemptRepo as never,
    {} as never,
    {} as never,
  );

  return { service, tasksRepo, usersRepo, quizAttemptRepo, workloadQuery };
}

const baseAgent = {
  id: 'agent-1',
  email: 'agent@example.com',
  firstName: 'Ada',
  lastName: 'Agent',
  profileImage: null,
  role: UserRole.AGENT,
  status: UserStatus.ACTIVE,
  verificationStatus: VerificationStatus.VERIFIED,
  isOnboarded: true,
  isQuizPassed: true,
  skills: ['Design'],
  languages: ['English'],
  hourlyRate: 25,
  currency: 'GBP',
  timezone: 'Europe/London',
  city: 'London',
  region: 'England',
  postcode: 'SW1A 1AA',
  mcomUserId: 'central-agent-1',
  createdAt: new Date(),
};

describe('AccountManagerService.getDelegatableAgents', () => {
  it('requires the manager to have a Central Hub link', async () => {
    const { service, usersRepo } = buildHarness();
    usersRepo.findOne.mockResolvedValue({ id: 'manager-1', mcomUserId: null });

    await expect(service.getDelegatableAgents('manager-1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('returns only qualified, centrally linked agents and consultants with workload', async () => {
    const { service, usersRepo, quizAttemptRepo, workloadQuery } = buildHarness();
    usersRepo.findOne.mockResolvedValue({
      id: 'manager-1',
      mcomUserId: 'central-manager-1',
    });
    usersRepo.find.mockResolvedValue([
      baseAgent,
      { ...baseAgent, id: 'agent-2', mcomUserId: null },
      {
        ...baseAgent,
        id: 'agent-3',
        verificationStatus: VerificationStatus.PENDING,
      },
      {
        ...baseAgent,
        id: 'consultant-1',
        role: UserRole.CONSULTANT,
        mcomUserId: 'central-consultant-1',
        firstName: 'Cleo',
        lastName: 'Consultant',
        skills: [],
      },
    ]);
    quizAttemptRepo.find.mockResolvedValue([
      { id: 'attempt-1', userId: 'agent-1', percentage: 88, band: 'pass', createdAt: new Date() },
    ]);
    workloadQuery.getRawMany.mockResolvedValue([
      { agentId: 'agent-1', active: '2', completed: '5', total: '7' },
      { agentId: 'consultant-1', active: '0', completed: '1', total: '1' },
    ]);

    const result = await service.getDelegatableAgents('manager-1');

    expect(result.scope).toBe('delegatable');
    expect(result.total).toBe(2);
    expect(result.items.map((item) => item.id)).toEqual(['consultant-1', 'agent-1']);
    expect(result.items[1]).toEqual(
      expect.objectContaining({
        mcomUserId: 'central-agent-1',
        skills: ['Design'],
        assessmentScore: 88,
        activeTasksCount: 2,
        completedTasksCount: 5,
        workload: { activeTasks: 2, completedTasks: 5, totalTasks: 7 },
      }),
    );
  });

  it('explains when nobody is eligible', async () => {
    const { service, usersRepo } = buildHarness();
    usersRepo.findOne.mockResolvedValue({
      id: 'manager-1',
      mcomUserId: 'central-manager-1',
    });
    usersRepo.find.mockResolvedValue([]);

    const result = await service.getDelegatableAgents('manager-1');

    expect(result.total).toBe(0);
    expect(result.message).toMatch(/No agents or consultants/i);
  });
});

describe('AccountManagerService.resolveCentralAssigneeId', () => {
  const localId = '11111111-1111-4111-8111-111111111111';
  const centralId = '22222222-2222-4222-8222-222222222222';

  it('translates a local UUID to its Central id', async () => {
    const { service, usersRepo } = buildHarness();
    usersRepo.findOne.mockResolvedValueOnce({
      id: localId,
      mcomUserId: centralId,
    });

    await expect(
      (service as never as {
        resolveCentralAssigneeId: (value: string) => Promise<string>;
      }).resolveCentralAssigneeId(localId),
    ).resolves.toBe(centralId);
  });

  it('rejects a local affiliate without a Central link', async () => {
    const { service, usersRepo } = buildHarness();
    usersRepo.findOne.mockResolvedValueOnce({
      id: localId,
      mcomUserId: null,
    });

    await expect(
      (service as never as {
        resolveCentralAssigneeId: (value: string) => Promise<string>;
      }).resolveCentralAssigneeId(localId),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('resolves a legacy email without querying the UUID column', async () => {
    const { service, usersRepo } = buildHarness();
    usersRepo.findOne.mockResolvedValueOnce({
      email: 'agent@example.com',
      mcomUserId: centralId,
    });

    await expect(
      (service as never as {
        resolveCentralAssigneeId: (value: string) => Promise<string>;
      }).resolveCentralAssigneeId('Agent@Example.com'),
    ).resolves.toBe(centralId);
  });

  it('rejects an unknown non-UUID identifier', async () => {
    const { service, usersRepo } = buildHarness();
    usersRepo.findOne.mockResolvedValueOnce(null);

    await expect(
      (service as never as {
        resolveCentralAssigneeId: (value: string) => Promise<string>;
      }).resolveCentralAssigneeId('not-an-id'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('passes an unknown well-formed UUID through for Central to validate', async () => {
    const { service, usersRepo } = buildHarness();
    usersRepo.findOne.mockResolvedValue(null);

    await expect(
      (service as never as {
        resolveCentralAssigneeId: (value: string) => Promise<string>;
      }).resolveCentralAssigneeId(centralId),
    ).resolves.toBe(centralId);
  });
});
