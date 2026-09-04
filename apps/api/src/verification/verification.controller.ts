import { Controller, Post, Get, Body, Patch, Param, Request } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { VerificationType, RequestStatus } from './entities/verification_request.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('verification')
@Controller('verification')
@ApiBearerAuth()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a verification request', description: 'Authenticated user. Requests Paid Visibility or Consultant verification.' })
  @ApiBody({ schema: { type: 'object', properties: { type: { type: 'string', enum: Object.values(VerificationType), example: 'paid_visibility' } } } })
  @ApiResponse({ status: 201, description: 'Request created', schema: { example: { id: 'uuid', status: 'pending' } } })
  create(@Request() req, @Body() body: { type: VerificationType }) {
    return this.verificationService.create(req.user.userId, body.type);
  }

  @Get('admin/requests')
  @ApiOperation({ summary: 'List all verification requests', description: 'Admin only. Returns pending requests.' })
  @ApiResponse({ status: 200, description: 'List of requests' })
  findAll() {
    // TODO: Add AdminRoleGuard
    return this.verificationService.findAll();
  }

  @Patch('admin/requests/:id')
  @ApiOperation({ summary: 'Approve or Reject a request', description: 'Admin only. Updates request status and user profile.' })
  @ApiBody({ schema: { type: 'object', properties: { status: { type: 'string', enum: Object.values(RequestStatus) }, notes: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Request updated' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: RequestStatus; notes?: string },
  ) {
    // TODO: Add AdminRoleGuard
    return this.verificationService.updateStatus(id, body.status, body.notes);
  }
}


