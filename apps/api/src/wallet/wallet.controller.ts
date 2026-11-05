import { Controller, Get, Post, Body, Query, Request, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { McomWalletService } from './mcom-wallet.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('wallet')
@Controller('wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
  @ApiOperation({ summary: 'Simulate a deposit', description: 'Dev/Test only. Deposits funds into current user wallet.' })
  @ApiBody({ schema: { type: 'object', properties: { amount: { type: 'number', example: 50.00 } } } })
  @ApiResponse({ status: 201, description: 'Deposit successful. Returns updated wallet.', schema: { example: { id: 'uuid', balance: 150.00 } } })
  deposit(@Request() req, @Body() body: { amount: number }) {
    return this.walletService.deposit(req.user.userId, body.amount);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get transaction history', description: 'Authenticated user. Returns list of transactions.' })
  @ApiResponse({ status: 200, description: 'Transaction history', schema: { example: [{ id: 'uuid', type: 'deposit', amount: 50.00, status: 'completed' }] } })
  getTransactions(@Request() req) {
    return this.walletService.getTransactions(req.user.userId);
  }
}


