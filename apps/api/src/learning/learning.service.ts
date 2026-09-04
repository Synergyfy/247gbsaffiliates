import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { LearningResource } from './entities/learning-resource.entity';

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
  ) {}

  async getResources(filters: ResourceFilters) {
    const { role, category, search } = filters;

    const qb = this.resourceRepo.createQueryBuilder('resource')
      .leftJoinAndSelect('resource.category', 'category')
      .where('resource.isPublished = true');

    if (role) {
      qb.andWhere('resource.targetRoles @> ARRAY[:role]', { role });
    }
    if (category) {
      qb.andWhere('category.slug = :category', { category });
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
}