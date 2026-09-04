import { Controller, Get } from '@nestjs/common';
import { SkillsService } from './skills.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get list of available skills', description: 'Public access. Returns all predefined skills.' })
  @ApiResponse({ status: 200, description: 'List of skills', schema: { example: [{ id: 'uuid', name: 'SEO', category: 'Marketing' }] } })
  findAll() {
    return this.skillsService.findAll();
  }
}



