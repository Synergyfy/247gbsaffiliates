import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';

@Injectable()
export class SkillsService implements OnModuleInit {
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
  ) {}

  async onModuleInit() {
    await this.seedSkills();
  }

  async findAll() {
    return this.skillsRepository.find();
  }

  private async seedSkills() {
    const count = await this.skillsRepository.count();
    if (count > 0) return;

    const defaultSkills = [
      'Social media setup & posting',
      'Email marketing basics',
      'Short product descriptions / copywriting',
      'ChatGPT / AI content generation',
      'Simple website checks (speed, links, SEO basics)',
      'Basic graphic design (banners, thumbnails)',
      'Customer messaging & support',
      'Local SEO / listings',
      'Google Ads basics',
      'Facebook ads basics',
    ];

    this.logger.log('Seeding default skills...');
    for (const name of defaultSkills) {
      await this.skillsRepository.save({ name, category: 'General' });
    }
    this.logger.log('Skills seeded successfully.');
  }
}

