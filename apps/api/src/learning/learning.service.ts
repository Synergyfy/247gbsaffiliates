import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { LearningResource } from './entities/learning-resource.entity';
import { CreateLearningResourceDto } from './dto/create-learning-resource.dto';
import { UpdateLearningResourceDto } from './dto/update-learning-resource.dto';
import { NotFoundException } from '@nestjs/common';
import { LearningProgress, LearningProgressStatus } from './entities/learning-progress.entity';

interface ResourceFilters {
  role?: string;
  category?: string;
  search?: string;
  userId?: string;
}

@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(LearningResource)
    private resourceRepo: Repository<LearningResource>,
    @InjectRepository(LearningProgress)
    private progressRepo: Repository<LearningProgress>,
  ) {}

  async getResources(filters: ResourceFilters) {
    const { role, category, search } = filters;

    const qb = this.resourceRepo.createQueryBuilder('resource')
      .leftJoinAndSelect('resource.category', 'category')
      .where('resource.isPublished = true');

    if (role) {
      qb.andWhere(
        '(resource.targetRoles IS NULL OR resource.targetRoles = :emptyRoles OR string_to_array(resource.targetRoles, :separator) @> ARRAY[:role]::text[])',
        { emptyRoles: '', separator: ',', role },
      );
    }
    if (category) {
      qb.andWhere('(category.id = :category OR category.name = :category)', { category });
    }
    if (search) {
      qb.andWhere(
        '(resource.title ILIKE :search OR resource.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const resources = await qb
      .orderBy('resource.priority', 'DESC')
      .addOrderBy('resource.createdAt', 'DESC')
      .getMany();

    return resources;
  }

  async getAdminResources() {
    return this.resourceRepo.find({
      relations: ['category'],
      order: { updatedAt: 'DESC' },
    });
  }

  async createAdminResource(dto: CreateLearningResourceDto) {
    const resource = this.resourceRepo.create({
      ...dto,
      categoryId: dto.categoryId || null,
      isPublished: dto.isPublished ?? false,
      targetRoles: [...new Set(dto.targetRoles)],
    });
    return this.resourceRepo.save(resource);
  }

  async updateAdminResource(id: string, dto: UpdateLearningResourceDto) {
    const resource = await this.resourceRepo.findOne({ where: { id } });
    if (!resource) throw new NotFoundException('Learning resource not found.');
    Object.assign(resource, dto);
    if (dto.categoryId !== undefined) resource.categoryId = dto.categoryId || null;
    if (dto.targetRoles) resource.targetRoles = [...new Set(dto.targetRoles)];
    return this.resourceRepo.save(resource);
  }

  async getMyProgress(userId: string, role: string) {
    const resources = await this.getResources({ role });
    if (!resources.length) return [];
    const progress = await this.progressRepo.find({ where: { userId } });
    const byResource = new Map(progress.map((row) => [row.resourceId, row]));
    return resources.map((resource) => {
      const row = byResource.get(resource.id);
      return {
        resourceId: resource.id,
        status: row?.status ?? 'not_started',
        completedAt: row?.completedAt ?? null,
      };
    });
  }

  async updateMyProgress(userId: string, role: string, resourceId: string, status: LearningProgressStatus) {
    const resource = await this.resourceRepo.findOne({ where: { id: resourceId, isPublished: true } });
    if (!resource || (resource.targetRoles?.length && !resource.targetRoles.includes(role))) {
      throw new NotFoundException('Learning resource not found.');
    }

    let progress = await this.progressRepo.findOne({ where: { userId, resourceId } });
    if (!progress) progress = this.progressRepo.create({ userId, resourceId });
    progress.status = status;
    progress.completedAt = status === LearningProgressStatus.COMPLETED ? new Date() : null;
    return this.progressRepo.save(progress);
  }
}
