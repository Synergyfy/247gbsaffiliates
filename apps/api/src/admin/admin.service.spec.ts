import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { VerificationStatus, User, UserRole } from '../users/entities/user.entity';

describe('AdminService affiliate verification decisions', () => {
  let service: AdminService;
  let user: User;
  const usersRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    user = {
      id: 'affiliate-1',
      role: UserRole.AGENT,
      verificationStatus: VerificationStatus.PENDING,
      verificationSubmission: null,
      verificationDocumentMimeType: null,
      verificationNotes: null,
      verificationReviewedAt: null,
      isOnboarded: false,
      isQuizPassed: false,
    } as User;
    usersRepo.findOne.mockResolvedValue(user);
    usersRepo.save.mockImplementation(async (value) => value);
    service = new AdminService(usersRepo as never, {} as never, {} as never, {} as never, {} as never);
  });

  it('does not approve an account without submitted profile data and identity document', async () => {
    await expect(service.reviewVerification('affiliate-1', VerificationStatus.VERIFIED))
      .rejects.toBeInstanceOf(ForbiddenException);
    expect(usersRepo.save).not.toHaveBeenCalled();
  });

  it('requires a reason when rejecting an account', async () => {
    await expect(service.reviewVerification('affiliate-1', VerificationStatus.REJECTED, '  '))
      .rejects.toBeInstanceOf(BadRequestException);
    expect(usersRepo.save).not.toHaveBeenCalled();
  });

  it('persists the rejection status and reason and leaves onboarding incomplete', async () => {
    const result = await service.reviewVerification('affiliate-1', VerificationStatus.REJECTED, 'Document image is unreadable.');

    expect(result).toEqual(expect.objectContaining({
      verificationStatus: VerificationStatus.REJECTED,
      verificationNotes: 'Document image is unreadable.',
      isOnboarded: false,
    }));
    expect(user.verificationReviewedAt).toBeInstanceOf(Date);
  });

  it('approves submitted verification but only completes onboarding when quiz and skills are also satisfied', async () => {
    user.verificationSubmission = { bio: 'Experienced affiliate' };
    user.verificationDocumentMimeType = 'application/pdf';
    user.isQuizPassed = true;
    user.skills = ['Client discovery'];
    const result = await service.reviewVerification('affiliate-1', VerificationStatus.VERIFIED);

    expect(result.verificationStatus).toBe(VerificationStatus.VERIFIED);
    expect(result.isOnboarded).toBe(true);
  });
});
