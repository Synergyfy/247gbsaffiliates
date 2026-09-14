import { Controller, Logger, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createHash } from 'crypto';
import { McomService } from './mcom.service';
import { UsersService } from '../users/users.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

interface CentralWebhookEvent {
  event?: string;
  type?: string;
  user_id?: string;
  mcomUserId?: string;
  membership?: { level?: string; tier?: string; status?: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

@ApiTags('webhooks')
@Controller()
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private readonly processedHashes = new Set<string>();

  constructor(
    private readonly mcomService: McomService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('webhooks')
  @ApiOperation({ summary: 'Central Hub lifecycle webhook' })
  async webhook(@Req() req: Request, @Res() res: Response): Promise<void> {
    const rawBody = JSON.stringify(req.body ?? {});
    const signatureHeader = req.headers['x-mcom-signature'] as
      | string
      | undefined;
    const timestampHeader = req.headers['x-mcom-timestamp'] as
      | string
      | undefined;

    // Verify HMAC when Central signs the request.
    if (signatureHeader && timestampHeader) {
      const valid = this.mcomService.verifyWebhookSignature(
        rawBody,
        signatureHeader,
        timestampHeader,
      );
      if (!valid) {
        this.logger.warn('Webhook signature verification failed');
        res.status(401).json({ error: 'Invalid HMAC signature' });
        return;
      }
    }

    // Idempotent dedup via SHA-256 body hash (in-memory, last 1000).
    const bodyHash = createHash('sha256').update(rawBody).digest('hex');
    if (this.processedHashes.has(bodyHash)) {
      res.status(200).json({ ok: true, duplicate: true });
      return;
    }
    this.processedHashes.add(bodyHash);
    if (this.processedHashes.size > 1000) {
      const oldest = Array.from(this.processedHashes).slice(0, 500);
      oldest.forEach((h) => this.processedHashes.delete(h));
    }

    const event = req.body as CentralWebhookEvent;
    const eventType = event.event || event.type || '';
    const mcomUserId = event.user_id || event.mcomUserId || '';

    this.logger.log(`Webhook received: ${eventType} for user ${mcomUserId}`);

    try {
      if (!mcomUserId) {
        res.status(200).json({ ok: true, noUser: true });
        return;
      }

      const users = await this.usersService['usersRepository'].find({
        where: { mcomUserId },
      });
      const user = users[0];

      if (!user) {
        this.logger.warn(`No local user for mcomUserId: ${mcomUserId}`);
        res.status(200).json({ ok: true, noUser: true });
        return;
      }

      // No plan gating on 247gbs affiliate: webhooks only sync
      // membership metadata for display. Access is never revoked here.
      switch (eventType) {
        case 'package.created':
        case 'package.renewed':
        case 'membership.updated':
        case 'user.updated':
          await this.usersService.update(user.id, {
            ...(event.membership?.status && {
              mcomMembershipStatus: event.membership.status,
            }),
            ...(event.membership?.level && {
              mcomMembershipLevel: event.membership.level,
            }),
            ...(event.membership?.tier && {
              mcomMembershipTier: event.membership.tier,
            }),
          } as never);
          break;

        case 'package.cancelled':
        case 'package.expired':
          // Sync status metadata only — do NOT revoke affiliate access.
          await this.usersService.update(user.id, {
            mcomMembershipStatus:
              eventType === 'package.expired' ? 'expired' : 'cancelled',
          } as never);
          break;

        case 'payment.failed':
          this.logger.warn(`Payment failed for ${user.id} (${user.email})`);
          break;

        default:
          this.logger.log(`Unhandled webhook event: ${eventType}`);
      }

      res.status(200).json({ ok: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Webhook processing error: ${message}`);
      // Return 200 so Central does not retry a poisoned event endlessly.
      res.status(200).json({ ok: true, error: message });
    }
  }
}
