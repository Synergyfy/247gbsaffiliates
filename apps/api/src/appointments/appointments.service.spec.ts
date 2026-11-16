import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { UserRole } from '../users/entities/user.entity';

function buildHarness(collision: { id: string } | null = null) {
  const query = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(collision),
  };
  const appointmentsRepo = {
    create: jest.fn((value: Record<string, unknown>) => ({
      ...value,
      id: 'appointment-1',
    })),
    save: jest.fn((value: Appointment) => Promise.resolve(value)),
    findOne: jest.fn(),
    findAndCount: jest.fn().mockResolvedValue([[], 0]),
    createQueryBuilder: jest.fn(() => query),
  };
  const usersService = {
    findOne: jest.fn(),
  };
  const tasksService = {
    create: jest.fn().mockResolvedValue({ id: 'task-1', title: 'Follow-up' }),
  };
  const service = new AppointmentsService(
    appointmentsRepo as never,
    usersService as never,
    tasksService as never,
  );
  return { service, appointmentsRepo, usersService, tasksService, query };
}

const consultant = {
  id: 'consultant-1',
  role: UserRole.CONSULTANT,
  email: 'consultant@example.test',
};

const manager = {
  id: 'manager-1',
  role: UserRole.ACCOUNT_MANAGER,
  email: 'manager@example.test',
};

const makeAppointment = (overrides: Partial<Appointment> = {}): Appointment =>
  ({
    id: 'appointment-1',
    consultantId: consultant.id,
    clientBusinessId: '11111111-1111-4111-8111-111111111111',
    title: 'Growth strategy review',
    notes: 'Agree the Q1 campaign brief.',
    scheduledAt: new Date('2026-12-01T10:00:00.000Z'),
    durationMinutes: 60,
    meetingUrl: null,
    status: AppointmentStatus.SCHEDULED,
    convertedTaskId: null,
    ...overrides,
  }) as Appointment;

describe('AppointmentsService', () => {
  it('rejects a slot that overlaps an existing active session', async () => {
    const { service, usersService } = buildHarness({ id: 'existing' });
    usersService.findOne.mockResolvedValue(consultant);

    await expect(
      service.create(consultant.id, {
        clientBusinessId: '11111111-1111-4111-8111-111111111111',
        title: 'Session',
        scheduledAt: '2026-12-01T10:30:00.000Z',
        durationMinutes: 30,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('lets a consultant schedule their own session', async () => {
    const { service, usersService, appointmentsRepo } = buildHarness();
    usersService.findOne.mockResolvedValue(consultant);

    const created = await service.create(consultant.id, {
      clientBusinessId: '11111111-1111-4111-8111-111111111111',
      title: '  Session  ',
      scheduledAt: '2026-12-01T10:00:00.000Z',
    });

    expect(created.consultantId).toBe(consultant.id);
    expect(created.title).toBe('Session');
    expect(appointmentsRepo.save).toHaveBeenCalled();
  });

  it('prevents a consultant from scheduling on behalf of another consultant', async () => {
    const { service, usersService } = buildHarness();
    usersService.findOne.mockResolvedValue(consultant);

    await expect(
      service.create(consultant.id, {
        consultantId: 'other-consultant',
        clientBusinessId: '11111111-1111-4111-8111-111111111111',
        title: 'Session',
        scheduledAt: '2026-12-01T10:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('requires an account manager to choose which consultant runs the session', async () => {
    const { service, usersService } = buildHarness();
    usersService.findOne.mockResolvedValue(manager);

    await expect(
      service.create(manager.id, {
        clientBusinessId: '11111111-1111-4111-8111-111111111111',
        title: 'Session',
        scheduledAt: '2026-12-01T10:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('converts an appointment into a fixed EUR task linked to the client business', async () => {
    const { service, usersService, tasksService, appointmentsRepo } =
      buildHarness();
    usersService.findOne.mockResolvedValue(manager);
    appointmentsRepo.findOne.mockResolvedValue(makeAppointment());

    const result = await service.convertToTask('appointment-1', manager.id, {
      budget: 500,
      assignedAgentId: '22222222-2222-4222-8222-222222222222',
    });

    expect(tasksService.create).toHaveBeenCalledWith(
      manager.id,
      expect.objectContaining({
        budget: 500,
        currency: 'EUR',
        centralBusinessId: '11111111-1111-4111-8111-111111111111',
        assignedAgentId: '22222222-2222-4222-8222-222222222222',
      }),
    );
    expect(appointmentsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ convertedTaskId: 'task-1' }),
    );
    expect(result.task.id).toBe('task-1');
  });

  it('refuses to convert the same appointment twice', async () => {
    const { service, usersService, appointmentsRepo } = buildHarness();
    usersService.findOne.mockResolvedValue(manager);
    appointmentsRepo.findOne.mockResolvedValue(
      makeAppointment({ convertedTaskId: 'task-existing' }),
    );

    await expect(
      service.convertToTask('appointment-1', manager.id, { budget: 500 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('does not let a consultant read another consultant’s appointment', async () => {
    const { service, usersService, appointmentsRepo } = buildHarness();
    usersService.findOne.mockResolvedValue(consultant);
    appointmentsRepo.findOne.mockResolvedValue(
      makeAppointment({ consultantId: 'someone-else' }),
    );

    await expect(
      service.findOneForUser('appointment-1', consultant.id),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('scopes the consultant list to the authenticated consultant', async () => {
    const { service, usersService, appointmentsRepo } = buildHarness();
    usersService.findOne.mockResolvedValue(consultant);

    await service.findAll(consultant.id, { page: 1, limit: 20 });

    expect(appointmentsRepo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ consultantId: consultant.id }),
      }),
    );
  });
});
