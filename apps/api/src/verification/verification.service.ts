import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationRequest, RequestStatus, VerificationType } from './entities/verification_request.entity';
import { UsersService } from '../users/users.service';
import { VerificationStatus } from '../users/entities/user.entity';

@Injectable()
export class VerificationService {
  constructor(
    @InjectRepository(VerificationRequest)
    private requestRepo: Repository<VerificationRequest>,
    private usersService: UsersService,
  ) {}

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

    request.status = status;
    request.adminNotes = notes || '';
    await this.requestRepo.save(request);

    // If approved, update user profile
    if (status === RequestStatus.APPROVED) {
      if (request.type === VerificationType.PAID_VISIBILITY) {
        await this.usersService.update(request.userId, { isPaidVisible: true });
      } else if (request.type === VerificationType.CONSULTANT_PROFILE) {
        await this.usersService.update(request.userId, { verificationStatus: VerificationStatus.VERIFIED });
      }
    }

    return request;
  }
}

