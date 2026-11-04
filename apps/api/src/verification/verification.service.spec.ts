import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { UserRole, VerificationStatus } from '../users/entities/user.entity';

describe('VerificationService account submission', () => {
  const user = {
    id: 'affiliate-1',
    role: UserRole.AGENT,
    verificationStatus: VerificationStatus.PENDING,
    isOnboarded: false,
    verificationNotes: null,
  } as any;
  const usersRepo = { save: jest.fn(async (value) => value) };
  const usersService = { findOne: jest.fn(async () => user) };
  let service: VerificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    user.verificationStatus = VerificationStatus.PENDING;
    user.isOnboarded = false;
    user.verificationSubmission = null;
    service = new VerificationService({} as never, usersRepo as never, usersService as never);
  });

  it('persists submitted profile and identity document while keeping verification pending', async () => {
    const result = await service.submitAccount('affiliate-1', {
      bio: 'Experienced partner',
      role: 'admin',
      phone: '+44 7700 900123',
      postalCode: 'SW1A 1AA',
      city: 'London',
      region: 'England',
      country: 'United Kingdom',
    }, {
      buffer: Buffer.from('%PDF-1.7 identity test'),
      mimetype: 'application/pdf',
      originalname: 'identity.pdf',
      size: 20,
    });

    expect(usersRepo.save).toHaveBeenCalledWith(expect.objectContaining({
      verificationStatus: VerificationStatus.PENDING,
      isOnboarded: false,
      verificationSubmission: {
        role: UserRole.AGENT,
        bio: 'Experienced partner',
        phone: '+44 7700 900123',
        postalCode: 'SW1A 1AA',
        city: 'London',
        region: 'England',
        country: 'United Kingdom',
      },
      verificationDocumentMimeType: 'application/pdf',
    }));
    expect(result.verificationStatus).toBe(VerificationStatus.PENDING);
  });

  it('retains previously saved fields omitted from the redesigned form', async () => {
    user.verificationSubmission = { portfolioUrl: 'https://example.test/portfolio', timezone: 'Europe/London' };

    await service.submitAccount('affiliate-1', {
      phone: '+44 7700 900123',
      postalCode: 'SW1A 1AA',
      country: 'United Kingdom',
    }, {
      buffer: Buffer.from('%PDF-1.7 identity test'),
      mimetype: 'application/pdf',
      originalname: 'identity.pdf',
      size: 20,
    });

    expect(user.verificationSubmission).toMatchObject({
      portfolioUrl: 'https://example.test/portfolio',
      timezone: 'Europe/London',
      phone: '+44 7700 900123',
      postalCode: 'SW1A 1AA',
    });
  });

  it('requires phone and postal code before saving verification submission', async () => {
    await expect(service.submitAccount('affiliate-1', { bio: 'Experienced partner' }, {
      buffer: Buffer.from('%PDF-1.7 identity test'),
      mimetype: 'application/pdf',
      originalname: 'identity.pdf',
      size: 20,
    })).rejects.toBeInstanceOf(BadRequestException);
    expect(usersRepo.save).not.toHaveBeenCalled();
  });

  it('prevents administrator accounts from submitting affiliate verification', async () => {
    usersService.findOne.mockResolvedValueOnce({ ...user, role: UserRole.ADMIN });
    await expect(service.submitAccount('admin-1', { bio: 'x' }, {
      buffer: Buffer.from('%PDF-1.7 test'), mimetype: 'application/pdf', originalname: 'id.pdf', size: 12,
    })).rejects.toBeInstanceOf(ForbiddenException);
  });
});
