import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { BusinessAcquisitionService } from './business-acquisition.service';
import { CentralAcquisitionEventDto } from './dto/business-acquisition.dto';

/**
 * Backend-to-backend events from Central Hub. When a business registers,
 * completes onboarding or is verified, Central notifies the affiliate portal
 * so the acquisition dashboard reflects the real CHS state.
 */
@ApiTags('internal')
@Controller('internal/business-acquisition')
export class BusinessAcquisitionInternalController {
  constructor(private readonly acquisition: BusinessAcquisitionService) {}

  @Public()
  @UseGuards(ApiKeyGuard)
  @Post('events')
  @ApiHeader({ name: 'x-api-key', required: true })
  @ApiOperation({ summary: 'Apply a CHS business acquisition lifecycle event' })
  async event(@Body() dto: CentralAcquisitionEventDto) {
    return { success: true, data: await this.acquisition.handleCentralEvent(dto) };
  }
}
