import { Controller, Post, Body, Req, Res, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createHash } from 'crypto';
import { McomService } from './mcom.service';
import { UsersService } from '../users/users.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('mcom')
@Controller('mcom')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private readonly processedHashes = new Set<string>();

  constructor(
    private mcomService: McomService,
    private usersService: UsersService,
  ) {}

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'MCOM Central lifecycle webhook' })
  async webhook(@Req() req: Request, @Res() res: Response) {
    const rawBody = JSON.stringify(req.body);
    const signature = req.headers['x-mcom-signature'] as string;
    const timestamp = req.headers['x-mcom-timestamp'] as string;

    // Verify HMAC signature
    if (signature && timestamp) {
      if (!this.mcomService.verifyWebhookSignature(rawBody, signature, timestamp)) {
        this.logger.warn('Webhook signature verification failed');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Idempotent dedup via SHA-256 body hashing
    const bodyHash = createHash('sha256').update(rawBody).digest('hex');
    if (this.processedHashes.has(bodyHash)) {
      return res.status(200).json({ ok: true, duplicate: true });
    }
    this.processedHashes.add(bodyHash);

    // Clean up old hashes periodically (keep last 1000)
    if (this.processedHashes.size > 1000) {
      const arr = Array.from(this.processedHashes);
      arr.slice(0, 500).forEach((h) => this.processedHashes.delete(h));
    }

    const event = req.body;
    const eventType: string = event.event || event.type || '';
    const mcomUserId: string = event.user_id || event.mcomUserId || '';

    this.logger.log(`Webhook received: ${eventType} for user ${mcomUserId}`);

    try {
      // Find user by mcomUserId
      const users = await this.usersService['usersRepository'].find({
        where: { mcomUserId },
      });
      const user = users[0];

      if (!user) {
        this.logger.warn(`No local user found for mcomUserId: ${mcomUserId}`);
        return res.status(200).json({ ok: true, noUser: true });
      }

      switch (eventType) {
        case 'package.created':
        case 'package.renewed':
          await this.usersService.update(user.id, {
            mcomMembershipStatus: 'active',
            mcomCanAccessVcard: true,
          } as any);
          if (event.membership) {
            await this.usersService.update(user.id, {
              mcomMembershipLevel: event.membership.level,
              mcomMembershipTier: event.membership.tier,
            } as any);
          }
          break;

        case 'package.cancelled':
        case 'package.expired':
          await this.usersService.update(user.id, {
            mcomMembershipStatus: eventType === 'package.expired' ? 'expired' : 'cancelled',
            mcomCanAccessVcard: false,
          } as any);
          break;

        case 'payment.failed':
          this.logger.warn(`Payment failed for user ${user.id} (${user.email})`);
          break;

        default:
          this.logger.log(`Unhandled webhook event: ${eventType}`);
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      this.logger.error(`Webhook processing error: ${err.message}`);
      return res.status(200).json({ ok: true, error: err.message });
    }
  }
}
