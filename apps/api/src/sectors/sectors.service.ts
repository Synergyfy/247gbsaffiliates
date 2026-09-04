import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { Sector } from './entities/sector.entity';

@Injectable()
export class SectorsService {
  constructor(
    @InjectRepository(Sector)
    private sectorRepo: Repository<Sector>,
  ) {}

  async create(createSectorDto: CreateSectorDto) {
    const existing = await this.sectorRepo.findOne({ where: { name: createSectorDto.name } });
    if (existing) throw new ConflictException('Sector name already exists');

    const sector = this.sectorRepo.create(createSectorDto);
    return this.sectorRepo.save(sector);
  }

  async findAll() {
    return this.sectorRepo.find({ relations: ['categories'] });
  }

  async findOne(id: string) {
    const sector = await this.sectorRepo.findOne({
      where: { id },
      relations: ['categories', 'categories.children'],
    });
    if (!sector) throw new NotFoundException('Sector not found');
    return sector;
  }

  async update(id: string, updateSectorDto: UpdateSectorDto) {
    const sector = await this.findOne(id);
    Object.assign(sector, updateSectorDto);
    return this.sectorRepo.save(sector);
  }

  async remove(id: string) {
    const sector = await this.findOne(id);
    return this.sectorRepo.remove(sector);
  }
}

