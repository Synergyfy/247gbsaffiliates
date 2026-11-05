import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';
import { UsersService } from './users.service';
import { WalletService } from '../wallet/wallet.service';

/**
 * Backend-to-backend directory endpoints. Secured by the shared internal API
 * key (Central Hub sends `x-api-key`). Not exposed as a user-facing API.
 */
@ApiTags('internal')
@Controller('internal')
export class InternalDirectoryController {
  constructor(
    private readonly usersService: UsersService,
    private readonly walletService: WalletService,
  ) {}

  @Public()
  @UseGuards(ApiKeyGuard)
  @Get('affiliates')
  @ApiHeader({ name: 'x-api-key', required: true })
  @ApiOperation({ summary: 'List active affiliates with skills (Central Hub only)' })
  async affiliates(@Query('skill') _skill?: string) {
    const users = await this.usersService.listAffiliateDirectory();
    return { success: true, data: users };
  }

  @Public()
  @UseGuards(ApiKeyGuard)
  @Post('affiliates/wallet/credit')
  @ApiHeader({ name: 'x-api-key', required: true })
  @ApiOperation({ summary: 'Pay an affiliate for an approved Central Hub task (idempotent)' })
  async creditWallet(
    @Body()
    body: {
      email?: string;
      amount?: number;
      currency?: string;
      description?: string;
      reference?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    if (!body?.email || !body?.reference) {
      throw new BadRequestException('email and reference are required');
    }
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('amount must be greater than zero');
    }
    const user = await this.usersService.findByEmail(body.email.trim().toLowerCase());
    if (!user) throw new NotFoundException('Affiliate account not found');

    const result = await this.walletService.creditForTask({
      userId: user.id,
      amount,
      currency: body.currency || 'GBP',
      description: body.description,
      reference: body.reference,
    });

    return {
      success: true,
      data: {
        affiliateId: user.id,
        email: user.email,
        reference: body.reference,
        amount,
        currency: body.currency || 'GBP',
        transactionId: result.transaction.id,
        balance: result.wallet?.balance,
        duplicated: result.duplicated,
      },
    };
  }
}
