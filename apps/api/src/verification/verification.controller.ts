import { BadRequestException, Controller, Post, Get, Body, Patch, Param, Request, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VerificationService } from './verification.service';
import { VerificationType, RequestStatus } from './entities/verification_request.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

const MAX_IDENTITY_DOCUMENT_BYTES = 5 * 1024 * 1024;
const ALLOWED_IDENTITY_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

interface IdentityDocumentUpload {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

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

  @Post('account')
  @UseInterceptors(FileInterceptor('identityDocument', {
    limits: { fileSize: MAX_IDENTITY_DOCUMENT_BYTES },
    fileFilter: (_request, file, callback) => {
      if (!ALLOWED_IDENTITY_DOCUMENT_TYPES.includes(file.mimetype)) {
        callback(new BadRequestException('Identity documents must be PDF, JPEG, or PNG files.'), false);
        return;
      }
      callback(null, true);
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', required: ['submission', 'identityDocument'], properties: { submission: { type: 'string', description: 'JSON profile submission' }, identityDocument: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Submit profile information and an identity document for affiliate verification' })
  @ApiResponse({ status: 201, description: 'Verification submission saved with pending status' })
  async submitAccount(
    @Request() req,
    @Body('submission') submissionJson: string,
    @UploadedFile() file?: IdentityDocumentUpload,
  ) {
    if (!file) throw new BadRequestException('Upload a PDF, JPEG, or PNG identity document (maximum 5 MB).');
    let submission: Record<string, unknown>;
    try {
      submission = JSON.parse(submissionJson || '{}');
    } catch {
      throw new BadRequestException('Profile submission must be valid JSON.');
    }
    return this.verificationService.submitAccount(req.user.userId, submission, file);
  }

  @Get('admin/requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all verification requests', description: 'Admin only. Returns pending requests.' })
  @ApiResponse({ status: 200, description: 'List of requests' })
  findAll() {
    // TODO: Add AdminRoleGuard
    return this.verificationService.findAll();
  }

  @Patch('admin/requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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


