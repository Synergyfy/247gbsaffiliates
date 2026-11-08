import {
  ConflictException,
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { McomWalletService } from './mcom-wallet.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('wallet')
@Controller('wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly mcomWalletService: McomWalletService,
  ) {}

  @Get('mcom')
  @ApiOperation({
    summary: 'Get my MCOM wallet',
    description:
      'Read-only Central Hub wallet for this affiliate: balance, available balance, active escrow holds and ledger entries.',
  })
  getMcomWallet(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mcomWalletService.getForUser(
      req.user.userId,
      Math.max(1, Number(page) || 1),
      Math.min(50, Math.max(1, Number(limit) || 20)),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get my local wallet balance', description: 'Authenticated user. Returns local wallet details.' })
  @ApiResponse({ status: 200, description: 'Wallet details', schema: { example: { id: 'uuid', balance: 100.00, currency: 'USD' } } })
  getMyWallet(@Request() req) {
    return this.walletService.findOneByUserId(req.user.userId);
  }

  @Post('deposit')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Simulate a deposit (admin only)',
    description:
      'Dev/Test only. Deposits funds into the specified user wallet. Restricted to administrators so an authenticated affiliate can never mint balance.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 50.0 },
        userId: {
          type: 'string',
          description: 'Target user id. Defaults to the calling admin.',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Deposit successful. Returns updated wallet.', schema: { example: { id: 'uuid', balance: 150.00 } } })
  @ApiResponse({ status: 403, description: 'Administrator role required.' })
  deposit(@Request() req, @Body() body: { amount: number; userId?: string }) {
    return this.walletService.deposit(body.userId || req.user.userId, body.amount);
  }

  @Post('withdraw')
  @ApiOperation({
    summary: 'Request a wallet withdrawal',
    description:
      'Affiliate payouts are held in the Central Hub MCOM wallet. Withdrawals are initiated from Central Hub; this endpoint returns a clear conflict instead of a 404 so clients can redirect the user.',
  })
  @ApiBody({ schema: { type: 'object', properties: { amount: { type: 'number', example: 50.0 } } } })
  @ApiResponse({ status: 409, description: 'Withdrawals must be initiated in Central Hub.' })
  withdraw() {
    throw new ConflictException({
      code: 'WITHDRAWALS_CENTRAL_ONLY',
      message:
        'Withdrawals are managed in Central Hub. Open your MCOM wallet in Central Hub to request a payout.',
    });
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history', description: 'Authenticated user. Returns list of transactions.' })
  @ApiResponse({ status: 200, description: 'Transaction history', schema: { example: [{ id: 'uuid', type: 'deposit', amount: 50.00, status: 'completed' }] } })
  getTransactions(@Request() req) {
    return this.walletService.getTransactions(req.user.userId);
  }
}


