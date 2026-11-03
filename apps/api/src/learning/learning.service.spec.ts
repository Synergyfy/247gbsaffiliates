import { NotFoundException } from '@nestjs/common';
import { LearningService } from './learning.service';
import { LearningProgressStatus } from './entities/learning-progress.entity';

describe('LearningService progress', () => {
  let service: LearningService;
  const resourceRepo = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
  };
  const progressRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => value),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LearningService(resourceRepo as never, progressRepo as never);
  });

  it('returns progress only for the signed-in user’s published role resources', async () => {
    const resources = [{ id: 'resource-1' }, { id: 'resource-2' }];
    const query = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(resources),
    };
    resourceRepo.createQueryBuilder.mockReturnValue(query);
    progressRepo.find.mockResolvedValue([{ resourceId: 'resource-1', status: LearningProgressStatus.COMPLETED, completedAt: new Date('2026-01-01') }]);

    const result = await service.getMyProgress('affiliate-1', 'agent');

    expect(progressRepo.find).toHaveBeenCalledWith({ where: { userId: 'affiliate-1' } });
    expect(result).toEqual([
      expect.objectContaining({ resourceId: 'resource-1', status: 'completed' }),
      expect.objectContaining({ resourceId: 'resource-2', status: 'not_started', completedAt: null }),
    ]);
  });

  it('prevents affiliates from updating unpublished or differently targeted resources', async () => {
    resourceRepo.findOne.mockResolvedValue(null);
    await expect(service.updateMyProgress('affiliate-1', 'agent', 'private-resource', LearningProgressStatus.COMPLETED))
      .rejects.toBeInstanceOf(NotFoundException);
    expect(progressRepo.save).not.toHaveBeenCalled();
  });

  it('persists completion for the authenticated affiliate and resource pair', async () => {
    resourceRepo.findOne.mockResolvedValue({ id: 'resource-1', targetRoles: ['agent'] });
    progressRepo.findOne.mockResolvedValue(null);

    const result = await service.updateMyProgress('affiliate-1', 'agent', 'resource-1', LearningProgressStatus.COMPLETED);

    expect(result).toEqual(expect.objectContaining({ userId: 'affiliate-1', resourceId: 'resource-1', status: 'completed' }));
    expect(result.completedAt).toBeInstanceOf(Date);
    expect(progressRepo.save).toHaveBeenCalledTimes(1);
  });
});
