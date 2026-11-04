import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationRequest, RequestStatus, VerificationType } from './entities/verification_request.entity';
import { UsersService } from '../users/users.service';
import { User, UserRole, VerificationStatus } from '../users/entities/user.entity';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationRequest)
    private requestRepo: Repository<VerificationRequest>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private usersService: UsersService,
  ) {}

  async submitAccount(userId: string, submission: Record<string, unknown>, document: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
    size: number;
  }) {
    const user = await this.usersService.findOne(userId);
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Administrator accounts do not require affiliate verification.');
    }
    if (user.verificationStatus === VerificationStatus.VERIFIED) {
      throw new ForbiddenException('This account is already verified. Contact support if you need a verification review.');
    }
    if (!document?.buffer?.length) {
      throw new BadRequestException('Upload a government-issued identity document to submit verification.');
    }
    const hasValidSignature = document.mimetype === 'application/pdf'
      ? document.buffer.subarray(0, 5).toString() === '%PDF-'
      : document.mimetype === 'image/jpeg'
        ? document.buffer[0] === 0xff && document.buffer[1] === 0xd8 && document.buffer[2] === 0xff
        : document.mimetype === 'image/png'
          ? document.buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
          : false;
    if (!hasValidSignature) {
      throw new BadRequestException('The uploaded identity document does not match its file type.');
    }

    const allowedFields = [
      'hourlyRate', 'bio', 'country', 'timezone', 'languages', 'portfolioUrl',
      'phone', 'postalCode', 'city', 'region',
      'licenseNumber', 'yearsExperience', 'company', 'expertise', 'linkedinUrl',
    ];
    const cleanSubmission: Record<string, unknown> = {};
    cleanSubmission.role = user.role;
    for (const key of allowedFields) {
      const value = submission[key];
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        cleanSubmission[key] = typeof value === 'string' ? value.trim().slice(0, 3000) : value;
      }
    }

    if (typeof cleanSubmission.phone !== 'string' || !cleanSubmission.phone) {
      throw new BadRequestException('A phone number is required to submit your profile.');
    }
    if (typeof cleanSubmission.postalCode !== 'string' || !cleanSubmission.postalCode) {
      throw new BadRequestException('A postal code is required to submit your profile.');
    }

    if (Object.keys(cleanSubmission).length === 0) {
      throw new BadRequestException('Submit your professional profile information before requesting verification.');
    }

    // Keep legacy profile fields in JSONB when users resubmit after those fields
    // have been removed from onboarding; do not discard historical values.
    user.verificationSubmission = {
      ...(user.verificationSubmission || {}),
      ...cleanSubmission,
    };
    user.verificationDocument = document.buffer;
    user.verificationDocumentName = document.originalname.replace(/[\\/\r\n\0]/g, '_').slice(0, 180);
    user.verificationDocumentMimeType = document.mimetype;
    user.verificationStatus = VerificationStatus.PENDING;
    user.verificationNotes = null;
    user.verificationReviewedAt = null;
    user.isOnboarded = false;

    const saved = await this.usersRepo.save(user);
    return {
      id: saved.id,
      verificationStatus: saved.verificationStatus,
      verificationNotes: saved.verificationNotes,
      verificationSubmission: saved.verificationSubmission,
      verificationReviewedAt: saved.verificationReviewedAt,
      isOnboarded: saved.isOnboarded,
    };
  }

  async create(userId: string, type: VerificationType) {
    const request = this.requestRepo.create({ userId, type });
    return this.requestRepo.save(request);
  }

  async findAll() {
    return this.requestRepo.find({ order: { createdAt: 'DESC' } });
  }

  async updateStatus(id: string, status: RequestStatus, notes?: string) {
    const request = await this.requestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');

    if (status === RequestStatus.APPROVED && request.type === VerificationType.CONSULTANT_PROFILE) {
      const user = await this.usersService.findOne(request.userId);
      if (!user.verificationSubmission || !user.verificationDocumentMimeType) {
        throw new ForbiddenException('The affiliate must submit profile information and an identity document before approval.');
      }
    }

    request.status = status;
    request.adminNotes = notes || '';
    await this.requestRepo.save(request);

    // If approved, update user profile
    if (status === RequestStatus.APPROVED) {
      if (request.type === VerificationType.PAID_VISIBILITY) {
        await this.usersService.update(request.userId, { isPaidVisible: true });
      } else if (request.type === VerificationType.CONSULTANT_PROFILE) {
        const user = await this.usersService.findOne(request.userId);
        await this.usersService.update(request.userId, {
          verificationStatus: VerificationStatus.VERIFIED,
          verificationNotes: request.adminNotes || null,
          verificationReviewedAt: new Date(),
        });
        if (user.isQuizPassed && user.skills?.length) {
          await this.usersService.completeOnboarding(request.userId);
        }
      }
    }

    return request;
  }
}

