import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

const mockTask: {
  id: string;
  title: string;
  status: TaskStatus;
  assignedAgentId: string | null;
} = {
  id: 'uuid-task-1',
  title: 'Affiliate Task',
  status: TaskStatus.OPEN,
  assignedAgentId: null,
};

const mockUser = {
  id: 'uuid-agent-1',
  role: UserRole.AGENT,
};

const mockAdmin = {
  id: 'uuid-admin-1',
  role: UserRole.ADMIN,
};

const mockRepo = {
  create: jest.fn().mockImplementation((dto) => ({ ...dto, id: 'uuid-new', status: TaskStatus.OPEN })),
  save: jest.fn().mockImplementation((task) => Promise.resolve({ ...mockTask, ...task })),
  findAndCount: jest.fn().mockResolvedValue([[mockTask], 1]),
  findOne: jest.fn().mockImplementation(({ where: { id } }) => {
    if (id === 'uuid-task-1') return Promise.resolve({ ...mockTask }); // Return copy
    return Promise.resolve(null);
  }),
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

const mockHttpService = {
  patch: jest.fn().mockReturnValue({ subscribe: jest.fn() }),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('http://localhost:3010/api/v1'),
};

describe('TasksService (AffiliateBackend)', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: mockRepo },
        { provide: UsersService, useValue: mockUsersService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create task from central', async () => {
    const dto = {
      externalTaskId: 'ext-1',
      originSystem: 'MCOM_MALL' as any,
      originRequesterId: 'req-1',
      title: 'Synced Task',
      description: 'Desc',
    };
    const result = await service.createFromCentral(dto);
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ externalTaskId: 'ext-1' }));
    expect(result.status).toBe(TaskStatus.OPEN);
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

  it('should respond to task (decline)', async () => {
    mockTask.status = TaskStatus.ASSIGNED;
    mockTask.assignedAgentId = 'uuid-agent-1';

    const result = await service.respondToTask('uuid-task-1', 'uuid-agent-1', 'decline');
    expect(result.status).toBe(TaskStatus.DECLINED);
  });
});