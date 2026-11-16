import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { FindAppointmentsQueryDto } from './dto/find-appointments.dto';
import { ConvertAppointmentToTaskDto } from './dto/convert-appointment-to-task.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

interface AuthenticatedRequest {
  user: { userId: string; role: UserRole };
}

@ApiTags('appointments')
@Controller('appointments')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(
  UserRole.AGENT,
  UserRole.CONSULTANT,
  UserRole.ACCOUNT_MANAGER,
  UserRole.ADMIN,
)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List appointments',
    description:
      'Affiliates see their own sessions; account managers and admins can filter by consultant or client business.',
  })
  @ApiResponse({ status: 200, description: 'Paginated appointments' })
  findAll(
    @Query() query: FindAppointmentsQueryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.appointmentsService.findAll(req.user.userId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an appointment with its notes and meeting link',
  })
  @ApiResponse({ status: 200, description: 'Appointment details' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized for this appointment',
  })
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.appointmentsService.findOneForUser(id, req.user.userId);
  }

  @Post()
  @ApiOperation({
    summary: 'Schedule an appointment',
    description:
      'Creates a consultancy session and rejects slots that overlap an existing active session for the same consultant.',
  })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({ status: 201, description: 'Appointment scheduled' })
  @ApiResponse({ status: 409, description: 'Slot unavailable' })
  create(
    @Body() dto: CreateAppointmentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.appointmentsService.create(req.user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update notes, meeting link, schedule or status',
    description:
      'Rescheduling is collision-checked. Status can be moved to IN_PROGRESS, COMPLETED, CANCELLED or RESCHEDULED.',
  })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiResponse({ status: 200, description: 'Appointment updated' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.appointmentsService.update(id, req.user.userId, dto);
  }

  @Post(':id/convert-to-task')
  @ApiOperation({
    summary: 'Convert session actions into a billable task',
    description:
      'Creates a fixed-budget EUR task linked to the appointment client business and stores the task id on the appointment.',
  })
  @ApiBody({ type: ConvertAppointmentToTaskDto })
  @ApiResponse({ status: 201, description: 'Task created and linked' })
  @ApiResponse({
    status: 409,
    description: 'Appointment was already converted',
  })
  convertToTask(
    @Param('id') id: string,
    @Body() dto: ConvertAppointmentToTaskDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.appointmentsService.convertToTask(id, req.user.userId, dto);
  }
}
