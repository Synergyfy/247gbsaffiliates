import { McomService } from './mcom.service';
import { UserRole, VerificationStatus } from '../users/entities/user.entity';

describe('McomService affiliate JIT registration', () => {
  it('provisions a new SSO affiliate through pending account creation', async () => {
    const created = {
      id: 'affiliate-1',
      email: 'new-affiliate@example.test',
      role: UserRole.AGENT,
      verificationStatus: VerificationStatus.PENDING,
      isOnboarded: false,
    };
    const usersService = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(created),
      update: jest.fn().mockResolvedValue(created),
      findOne: jest.fn().mockResolvedValue(created),
    };
    const service = new McomService({} as never, {} as never, usersService as never);

    const result = await service.jitProvision({ sub: 'central-1', email: created.email, name: 'New Affiliate', role: 'agent' });

    expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({ email: created.email, role: UserRole.AGENT }));
    expect(result.verificationStatus).toBe(VerificationStatus.PENDING);
    expect(result.isOnboarded).toBe(false);
  });
});
