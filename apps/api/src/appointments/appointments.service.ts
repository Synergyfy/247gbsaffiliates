import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FindAppointmentsQueryDto } from './dto/find-appointments.dto';
import { ConvertAppointmentToTaskDto } from './dto/convert-appointment-to-task.dto';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';
import { CreateTaskDto } from '../tasks/dto/create-task.dto';
import { TaskType } from '../tasks/entities/task.entity';
import { User, UserRole } from '../users/entities/user.entity';

const AFFILIATE_SESSION_ROLES = [
  UserRole.AGENT,
  UserRole.ACCOUNT_MANAGER,
  UserRole.CONSULTANT,
];

const SCHEDULER_ROLES = [...AFFILIATE_SESSION_ROLES, UserRole.ADMIN];

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepo: Repository<Appointment>,
    private readonly usersService: UsersService,
    private readonly tasksService: TasksService,
  ) {}

  async create(userId: string, dto: CreateAppointmentDto) {
    const requester = await this.loadRequester(userId);
    const consultantId = this.resolveConsultantId(requester, dto.consultantId);
    const consultant = await this.assertConsultant(consultantId);

    const scheduledAt = this.parseDate(dto.scheduledAt, 'scheduledAt');
    const durationMinutes = dto.durationMinutes ?? 60;
    await this.assertSlotAvailable(consultant.id, scheduledAt, durationMinutes);

    const appointment = this.appointmentsRepo.create({
      consultantId: consultant.id,
      clientBusinessId: dto.clientBusinessId,
      title: dto.title.trim(),
      notes: dto.notes?.trim() || null,
      scheduledAt,
      durationMinutes,
      meetingUrl: dto.meetingUrl?.trim() || null,
      status: AppointmentStatus.SCHEDULED,
    });

    return this.appointmentsRepo.save(appointment);
  }

  async findAll(userId: string, query: FindAppointmentsQueryDto) {
    const requester = await this.loadRequester(userId);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    const where: FindOptionsWhere<Appointment> = {};

    if (
      requester.role !== UserRole.ADMIN &&
      requester.role !== UserRole.ACCOUNT_MANAGER
    ) {
      if (query.consultantId && query.consultantId !== requester.id) {
        throw new ForbiddenException(
          'Affiliates can only list their own appointments.',
        );
      }
      where.consultantId = requester.id;
    } else if (query.consultantId) {
      where.consultantId = query.consultantId;
    }

    if (query.clientBusinessId) {
      where.clientBusinessId = query.clientBusinessId;
    }
    if (query.status) {
      where.status = query.status;
    }

    const from = query.from ? this.parseDate(query.from, 'from') : null;
    const to = query.to ? this.parseDate(query.to, 'to') : null;
    if (from && to) {
      if (from > to) {
        throw new BadRequestException('`from` must be before `to`.');
      }
      where.scheduledAt = Between(from, to);
    } else if (from) {
      where.scheduledAt = MoreThanOrEqual(from);
    } else if (to) {
      where.scheduledAt = LessThanOrEqual(to);
    }

    const [items, total] = await this.appointmentsRepo.findAndCount({
      where,
      order: { scheduledAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      meta: { total, page, lastPage: Math.ceil(total / limit) },
    };
  }

  async findOneForUser(id: string, userId: string) {
    const requester = await this.loadRequester(userId);
    const appointment = await this.findAppointment(id);
    this.assertCanAccess(appointment, requester);
    return appointment;
  }

  async update(id: string, userId: string, dto: UpdateAppointmentDto) {
    const requester = await this.loadRequester(userId);
    const appointment = await this.findAppointment(id);
    this.assertCanAccess(appointment, requester);

    const nextScheduledAt = dto.scheduledAt
      ? this.parseDate(dto.scheduledAt, 'scheduledAt')
      : appointment.scheduledAt;
    const nextDuration = dto.durationMinutes ?? appointment.durationMinutes;
    const nextStatus = dto.status ?? appointment.status;

    const slotChanged =
      nextScheduledAt.getTime() !== appointment.scheduledAt.getTime() ||
      nextDuration !== appointment.durationMinutes;
    const reactivating =
      appointment.status === AppointmentStatus.CANCELLED &&
      nextStatus !== AppointmentStatus.CANCELLED;

    if (
      (slotChanged || reactivating) &&
      nextStatus !== AppointmentStatus.CANCELLED
    ) {
      await this.assertSlotAvailable(
        appointment.consultantId,
        nextScheduledAt,
        nextDuration,
        appointment.id,
      );
    }

    if (typeof dto.title === 'string') {
      const title = dto.title.trim();
      if (!title) {
        throw new BadRequestException('Appointment title cannot be empty.');
      }
      appointment.title = title;
    }
    if (typeof dto.notes === 'string') {
      appointment.notes = dto.notes.trim() || null;
    }
    if (dto.scheduledAt) {
      // A successful reschedule is the event that moves the slot; the explicit
      // status (including RESCHEDULED) remains under the caller's control.
      appointment.scheduledAt = nextScheduledAt;
    }
    if (dto.durationMinutes != null) {
      appointment.durationMinutes = nextDuration;
    }
    if (typeof dto.meetingUrl === 'string') {
      appointment.meetingUrl = dto.meetingUrl.trim() || null;
    }
    if (dto.status) {
      appointment.status = dto.status;
    }

    return this.appointmentsRepo.save(appointment);
  }

  /**
   * Turn the advisory output of a session into real, billable work. The task
   * inherits the appointment's client business so the affiliate dashboard and
   * the Central Hub project trail point at the same client.
   */
  async convertToTask(
    id: string,
    userId: string,
    dto: ConvertAppointmentToTaskDto,
  ) {
    const requester = await this.loadRequester(userId);
    const appointment = await this.findAppointment(id);
    this.assertCanAccess(appointment, requester);

    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException(
        'A cancelled appointment cannot be converted into a task.',
      );
    }
    if (appointment.convertedTaskId) {
      throw new ConflictException({
        code: 'APPOINTMENT_ALREADY_CONVERTED',
        message:
          'This appointment has already been converted into a task. Open the existing task to update it.',
        taskId: appointment.convertedTaskId,
      });
    }

    const createTaskDto: CreateTaskDto = {
      title:
        dto.title?.trim() || `Follow-up: ${appointment.title}`.slice(0, 200),
      description:
        dto.description?.trim() ||
        appointment.notes?.trim() ||
        `Actions agreed during the consultancy session "${appointment.title}".`,
      budget: dto.budget,
      // Fixed EUR budgets are the 247GBS standard; the conversion endpoint does
      // not accept a caller-supplied currency.
      currency: 'EUR',
      type: TaskType.ONE_TIME,
      assignedAgentId: dto.assignedAgentId,
      requiredSkills: dto.requiredSkills,
      dueDate: dto.dueDate,
      centralProjectId: dto.centralProjectId,
      centralBusinessId: appointment.clientBusinessId,
    };

    const task = await this.tasksService.create(requester.id, createTaskDto);

    appointment.convertedTaskId = task.id;
    appointment.convertedAt = new Date();
    appointment.convertedByUserId = requester.id;
    const saved = await this.appointmentsRepo.save(appointment);

    return { appointment: saved, task };
  }

  private async loadRequester(userId: string): Promise<User> {
    const user = await this.usersService.findOne(userId);
    if (!SCHEDULER_ROLES.includes(user.role)) {
      throw new ForbiddenException(
        'Only agents, consultants, account managers and administrators can manage appointments.',
      );
    }
    return user;
  }

  private resolveConsultantId(requester: User, requested?: string): string {
    if (
      requester.role !== UserRole.ADMIN &&
      requester.role !== UserRole.ACCOUNT_MANAGER
    ) {
      if (requested && requested !== requester.id) {
        throw new ForbiddenException(
          'Affiliates can only schedule their own appointments.',
        );
      }
      return requester.id;
    }
    if (!requested) {
      throw new BadRequestException(
        'Select the consultant who will run this session.',
      );
    }
    return requested;
  }

  private async assertConsultant(consultantId: string): Promise<User> {
    const consultant = await this.usersService.findOne(consultantId);
    // The session owner is normally a consultant, but the appointments module
    // is shared across the affiliate roles: agents and account managers can
    // also deliver advisory sessions.
    if (!AFFILIATE_SESSION_ROLES.includes(consultant.role)) {
      throw new BadRequestException(
        'Appointments can only be assigned to an agent, account manager or consultant account.',
      );
    }
    return consultant;
  }

  private async findAppointment(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepo.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  private assertCanAccess(appointment: Appointment, requester: User): void {
    if (
      requester.role === UserRole.ADMIN ||
      requester.role === UserRole.ACCOUNT_MANAGER
    ) {
      return;
    }
    if (appointment.consultantId === requester.id) {
      return;
    }
    throw new ForbiddenException(
      'You are not authorized to access this appointment.',
    );
  }

  /**
   * A consultant cannot be double-booked. Two sessions collide when the new
   * start falls before the existing end and the existing start falls before
   * the new end. Cancelled sessions release their slot.
   */
  private async assertSlotAvailable(
    consultantId: string,
    scheduledAt: Date,
    durationMinutes: number,
    excludeAppointmentId?: string,
  ): Promise<void> {
    const end = new Date(scheduledAt.getTime() + durationMinutes * 60_000);

    const query = this.appointmentsRepo
      .createQueryBuilder('appointment')
      .where('appointment.consultantId = :consultantId', { consultantId })
      .andWhere('appointment.status <> :cancelled', {
        cancelled: AppointmentStatus.CANCELLED,
      })
      .andWhere('appointment.scheduledAt < :end', { end })
      .andWhere(
        "appointment.scheduledAt + (appointment.durationMinutes * INTERVAL '1 minute') > :start",
        { start: scheduledAt },
      );

    if (excludeAppointmentId) {
      query.andWhere('appointment.id <> :excludeAppointmentId', {
        excludeAppointmentId,
      });
    }

    const collision = await query.select('appointment.id').getOne();
    if (collision) {
      throw new ConflictException({
        code: 'APPOINTMENT_SLOT_UNAVAILABLE',
        message:
          'This consultant already has a session during that time. Choose another slot.',
        conflictingAppointmentId: collision.id,
      });
    }
  }

  private parseDate(value: string, field: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`\`${field}\` must be a valid date.`);
    }
    return date;
  }
}
