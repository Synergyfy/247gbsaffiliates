import { Controller, Get, Post, Body, Param, Query, Patch, Request, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateTaskFromCentralDto } from './dto/create-task-from-central.dto';
import { FindTasksQueryDto } from './dto/find-tasks.dto';
import { TaskStatus } from './entities/task.entity';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';

@ApiTags('tasks')
@Controller('tasks')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ACCOUNT_MANAGER, UserRole.CONSULTANT)
  @ApiOperation({ summary: 'Create a new task (Internal)', description: 'Restricted to: Admin, Account Manager, Consultant. Creates a manual task not linked to Central.' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden. Role not authorized.' })
  create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.userId, createTaskDto);
  }

  @Post('incoming')
  @UseGuards(ApiKeyGuard)
  @ApiOperation({ 
    summary: 'Receive task from Central', 
    description: 'Webhook endpoint called by mcom_central to sync tasks. Secured by Internal API Key.' 
  })
  @ApiBody({ 
    type: CreateTaskFromCentralDto,
    examples: {
      sync: {
        summary: 'Incoming Sync Payload',
        value: {
          externalTaskId: 'uuid-central-1',
          originSystem: 'MCOM_LOYALTY',
          originRequesterId: 'uuid-biz-1',
          title: '[Loyalty] Task Title',
          description: 'Description...',
          taskType: 'CAMPAIGN_CREATION'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Task synced successfully' })
  incoming(@Body() dto: CreateTaskFromCentralDto) {
    return this.tasksService.createFromCentral(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tasks', description: 'Authenticated users. Returns paginated tasks.' })
  findAll(@Query() query: FindTasksQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task details', description: 'Authenticated users.' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post(':id/assign')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Assign task to an agent', 
    description: 'Restricted to: Admin only. Assigns a task to a non-admin user (Agent, Account Manager, Consultant).' 
  })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { agentId: { type: 'string', example: 'uuid-agent', description: 'UUID of the agent to assign' } } 
    } 
  })
  @ApiResponse({ status: 201, description: 'Task assigned successfully' })
  assign(@Param('id') id: string, @Body('agentId') agentId: string) {
    return this.tasksService.assign(id, agentId);
  }

  @Post(':id/accept')
  @ApiOperation({ 
    summary: 'Accept an assigned task', 
    description: 'Authenticated user accepts a task assigned to them. Updates status to ACCEPTED.' 
  })
  @ApiResponse({ status: 200, description: 'Task accepted' })
  accept(@Param('id') id: string, @Request() req) {
    return this.tasksService.respondToTask(id, req.user.userId, 'accept');
  }

  @Post(':id/decline')
  @ApiOperation({ 
    summary: 'Decline an assigned task', 
    description: 'Authenticated user declines a task assigned to them. Updates status to DECLINED.' 
  })
  @ApiResponse({ status: 200, description: 'Task declined' })
  decline(@Param('id') id: string, @Request() req) {
    return this.tasksService.respondToTask(id, req.user.userId, 'decline');
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update task status', description: 'Authenticated users (typically assigned agent or client).' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { status: { type: 'string', enum: Object.values(TaskStatus), example: 'completed' } } 
    } 
  })
  @ApiResponse({ status: 200, description: 'Status updated' })
  updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus) {
    return this.tasksService.updateStatus(id, status);
  }
}



