import { ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole, VerificationStatus } from './entities/user.entity';

describe('UsersService onboarding verification gate', () => {
  let service: UsersService;
  let user: Partial<User>;
  const repository = {
    findOne: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    user = {
      id: 'affiliate-1',
      role: UserRole.AGENT,
      verificationStatus: VerificationStatus.PENDING,
      verificationSubmission: { country: 'GB' },
      verificationDocumentMimeType: 'application/pdf',
      isQuizPassed: true,
      skills: ['Client discovery'],
      isOnboarded: false,
    };
    repository.findOne.mockImplementation(async () => user);
    repository.save.mockImplementation(async (value) => Object.assign(user as object, value));
    service = new UsersService(repository as never);
  });

  it('refuses onboarding completion while verification is pending, even when other requirements are complete', async () => {
    await expect(service.completeOnboarding('affiliate-1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('registers a new affiliate as pending verification and not onboarded', async () => {
    repository.findOne.mockResolvedValueOnce(null);
    const created = await service.create({ email: 'new-affiliate@example.test', password: 'secure-password', role: UserRole.AGENT });

    expect(created.verificationStatus).toBe(VerificationStatus.PENDING);
    expect(created.isOnboarded).toBe(false);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      verificationStatus: VerificationStatus.PENDING,
      isOnboarded: false,
      role: UserRole.AGENT,
    }));
  });

  it('requires profile submission, identity document, assessment, and skills after verification', async () => {
    user.verificationStatus = VerificationStatus.VERIFIED;
    user.verificationDocumentMimeType = null;

    await expect(service.completeOnboarding('affiliate-1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('completes onboarding once an admin verified the submitted profile and all existing requirements are met', async () => {
    user.verificationStatus = VerificationStatus.VERIFIED;

    const result = await service.completeOnboarding('affiliate-1');

    expect(result.isOnboarded).toBe(true);
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ isOnboarded: true }));
  });
});
