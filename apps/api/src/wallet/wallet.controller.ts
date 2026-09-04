import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('wallet')
@Controller('wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @ApiOperation({ summary: 'Get my wallet balance', description: 'Authenticated user. Returns wallet details.' })
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


