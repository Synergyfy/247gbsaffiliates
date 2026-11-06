import { Controller, Get, Post, Body, Param, Query, Patch, Request, Res, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { basename, extname, join } from 'path';
import * as fs from 'fs';
import type { Response } from 'express';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateTaskFromCentralDto } from './dto/create-task-from-central.dto';
import { CreateWorkRequestDto } from './dto/create-work-request.dto';
import { FindTasksQueryDto } from './dto/find-tasks.dto';
import { CentralStatusUpdateDto, DeclineTaskDto, ReviewCallbackDto, SubmitTaskDto } from './dto/task-collaboration.dto';
import { TaskStatus } from './entities/task.entity';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';

const TASK_UPLOAD_DIR = join(process.cwd(), 'uploads', 'tasks');
fs.mkdirSync(TASK_UPLOAD_DIR, { recursive: true });

@ApiTags('tasks')
@Controller('tasks')
@ApiBearerAuth()
@UseGuards(RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ACCOUNT_MANAGER)
  @ApiOperation({ summary: 'Create a new task (Admin or Account Manager)', description: 'Creates a manual task not linked to Central.' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden. Role not authorized.' })
  create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.userId, createTaskDto);
  }

  @Post('requests')
  @Public()
  @ApiOperation({ summary: 'Submit a public enterprise work request from Find Affiliates' })
  @ApiBody({ type: CreateWorkRequestDto })
  @ApiResponse({ status: 201, description: 'Work request created' })
  createWorkRequest(@Body() dto: CreateWorkRequestDto) {
    return this.tasksService.createWorkRequest(dto);
  }

  @Post('incoming')
  @Public()
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
  findAll(@Query() query: FindTasksQueryDto, @Request() req) {
    return this.tasksService.findAll(query, req.user.userId, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task details', description: 'Authenticated users. Affiliates can only view tasks assigned to them.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOneForUser(id, req.user.userId, req.user.role);
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
    description: 'Authenticated user declines a task assigned to them. A reason is required so the business and administrators can reassign it.' 
  })
  @ApiBody({ type: DeclineTaskDto })
  @ApiResponse({ status: 200, description: 'Task declined' })
  decline(@Param('id') id: string, @Body() dto: DeclineTaskDto, @Request() req) {
    return this.tasksService.respondToTask(id, req.user.userId, 'decline', { reason: dto.reason });
  }

  @Post(':id/submit')
  @ApiOperation({
    summary: 'Submit a task for Central review',
    description: 'Accept an accepted/revision-requested task with notes, links, images, docs or PDFs. Manual admin review follows.',
  })
  @ApiBody({ type: SubmitTaskDto })
  submit(@Param('id') id: string, @Body() dto: SubmitTaskDto, @Request() req) {
    return this.tasksService.submit(id, req.user.userId, dto);
  }

  @Post(':id/acknowledge-review')
  @ApiOperation({
    summary: 'Acknowledge admin review notes',
    description: 'Marks the latest review as seen so the affiliate can make changes and resubmit.',
  })
  acknowledgeReview(@Param('id') id: string, @Request() req) {
    return this.tasksService.acknowledgeReview(id, req.user.userId);
  }

  @Post(':id/attachments')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: TASK_UPLOAD_DIR,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = new Set([
          '.png', '.jpg', '.jpeg', '.gif', '.webp',
          '.pdf', '.doc', '.docx', '.txt', '.csv', '.xlsx',
        ]);
        const ext = extname(file.originalname || '').toLowerCase();
        if (!allowed.has(ext)) {
          return cb(new BadRequestException('Unsupported attachment type'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload a photo, image, PDF or document for a task submission',
    description: 'Returns a URL that can be included in the submission attachments array.',
  })
  async uploadAttachment(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Request() req,
  ) {
    if (!file) throw new BadRequestException('A file is required');
    // Only the assignee (or an admin) may attach deliverables.
    await this.tasksService.findOneForUser(id, req.user.userId, req.user.role);

    // Multer's `dest` names files randomly without an extension — append it so
    // the served file keeps a correct content type.
    const ext = extname(file.originalname || '').toLowerCase();
    const finalPath = `${file.path}${ext}`;
    fs.renameSync(file.path, finalPath);
    const filename = basename(finalPath);
    const base = `${req.protocol}://${req.get('host')}`;
    const kind = /\.(png|jpe?g|gif|webp)$/i.test(filename) ? 'IMAGE' : 'DOCUMENT';
    return {
      url: `${base}/api/v1/tasks/attachments/${filename}`,
      fileName: file.originalname,
      mimeType: file.mimetype,
      kind,
    };
  }

  @Public()
  @Get('attachments/:filename')
  @ApiOperation({ summary: 'Serve an uploaded task attachment' })
  serveAttachment(@Param('filename') filename: string, @Res() res: Response) {
    // Strict basename check — no path traversal.
    if (!/^[a-f0-9-]{16,64}\.[a-z0-9]{1,8}$/i.test(filename)) {
      throw new BadRequestException('Invalid attachment name');
    }
    const filePath = join(process.cwd(), 'uploads', 'tasks', filename);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('Attachment not found');
    }
    res.sendFile(filePath);
  }

  @Post('external/:externalTaskId/status')
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', required: true })
  @ApiOperation({
    summary: 'Apply a Central status/charge-approval update',
    description: 'Backend-to-backend: lifts the chargeable-work hold, cancels or closes a task.',
  })
  @ApiBody({ type: CentralStatusUpdateDto })
  applyStatus(
    @Param('externalTaskId') externalTaskId: string,
    @Body() dto: CentralStatusUpdateDto,
  ) {
    return this.tasksService.applyStatusFromCentral(externalTaskId, dto);
  }

  @Post('external/:externalTaskId/review')
  @Public()
  @UseGuards(ApiKeyGuard)
  @ApiHeader({ name: 'x-api-key', required: true })
  @ApiOperation({
    summary: 'Apply a Central admin review outcome',
    description: 'Backend-to-backend: approves or requests changes on a submitted task. Secured by Internal API Key.',
  })
  @ApiBody({ type: ReviewCallbackDto })
  applyReview(@Param('externalTaskId') externalTaskId: string, @Body() dto: ReviewCallbackDto) {
    return this.tasksService.applyReviewFromCentral(externalTaskId, {
      decision: dto.decision,
      notes: dto.notes,
      round: dto.round,
      compensationPence: dto.compensationPence,
      compensationAmount: dto.compensationAmount,
    });
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
  updateStatus(@Param('id') id: string, @Body('status') status: TaskStatus, @Request() req) {
    return this.tasksService.updateStatus(id, status, req.user.userId);
  }
}



