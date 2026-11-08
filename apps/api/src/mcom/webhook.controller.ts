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
  platform?: string;
  timestamp?: string;
  user_id?: string;
  mcomUserId?: string;
  data?: {
    user_id?: string;
    mcomUserId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
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
    const webhookSignatureHeader = req.headers['x-mcom-webhook-signature'] as
      | string
      | undefined;

    // Verify HMAC. Supports both Central's raw-body scheme
    // (X-Mcom-Webhook-Signature) and the legacy timestamp.body scheme.
    if (webhookSignatureHeader) {
      const valid = this.mcomService.verifyRawBodySignature(
        rawBody,
        webhookSignatureHeader,
      );
      if (!valid) {
        this.logger.warn('Webhook raw-body signature verification failed');
        res.status(401).json({ error: 'Invalid HMAC signature' });
        return;
      }
    } else if (signatureHeader && timestampHeader) {
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
    const data = event.data ?? {};
    const mcomUserId =
      data.mcomUserId || data.user_id || event.user_id || event.mcomUserId || '';

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

      // Affiliates do not have platform memberships. Membership/package
      // events are acknowledged but never stored or used to gate access.
      switch (eventType) {
        case 'package.created':
        case 'package.renewed':
        case 'membership.updated':
        case 'user.updated':
          this.logger.log(
            `Central event ${eventType} acknowledged for ${user.email}; no affiliate membership state is stored.`,
          );
          break;

        case 'package.cancelled':
        case 'package.expired':
          this.logger.log(
            `Central ${eventType} for ${user.email}; affiliate access is not revoked.`,
          );
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
