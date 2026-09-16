import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { McomService } from './mcom.service';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  setOAuthStateCookie,
  getOAuthStateCookie,
  clearOAuthStateCookie,
  setReturnCookie,
  getReturnCookie,
  clearReturnCookie,
} from './oauth-state.util';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import {
  MCOM_PERMISSION_KEY,
  MCOM_PERMISSION_KEY_LEGACY,
} from './mcom.types';

function sanitizeRole(role: unknown): string {
  const raw = typeof role === 'string' && role ? role : 'agent';
  return raw.toLowerCase().replace(/[^a-z-]/g, '').replace('_', '-') || 'agent';
}

@ApiTags('auth/sso')
@Controller('auth/sso')
export class SsoController {
  private readonly logger = new Logger(SsoController.name);

  constructor(
    private readonly mcomService: McomService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  private frontendUrl(): string {
    return (
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:7089'
    ).replace(/\/$/, '');
  }

  // ── Step 1: set 32-byte CSRF state cookie, redirect to Central ──

  @Public()
  @Get('login')
  @ApiOperation({ summary: 'Initiate Central Hub OAuth login' })
  async login(
    @Req() _req: Request,
    @Res() res: Response,
    @Query('card') card?: string,
    @Query('business') business?: string,
    @Query('redirect') redirect?: string,
  ): Promise<void> {
    const state = randomBytes(32).toString('hex');
    setOAuthStateCookie(res, state);

    if (card || business || redirect) {
      setReturnCookie(res, {
        card: card ?? '',
        business: business ?? '',
        redirect: redirect ?? '',
      });
    }

    res.redirect(this.mcomService.getAuthorizeUrl(state));
  }

  // ── Step 2: Central redirects here (MCOM_REDIRECT_URI). Exchange
  // code server-side, JIT-provision (no plan gating), issue local JWT,
  // then redirect to the web app with token+role. ──

  @Public()
  @Get('callback')
  @ApiOperation({ summary: 'Complete Central Hub OAuth callback' })
  async callback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
  ): Promise<void> {
    const frontendUrl = this.frontendUrl();

    if (error) {
      this.logger.warn(`Central SSO error: ${error}`);
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!code || !state) {
      res.redirect(`${frontendUrl}/login?error=sso_callback_failed`);
      return;
    }

    const savedState = getOAuthStateCookie(req);
    clearOAuthStateCookie(res);

    if (!savedState || savedState !== state) {
      this.logger.warn('SSO state mismatch (possible CSRF)');
      res.redirect(`${frontendUrl}/login?error=sso_state_mismatch`);
      return;
    }

    try {
      const tokenResponse = await this.mcomService.exchangeCode(code);
      const centralUser = tokenResponse.user;

      if (!centralUser?.email || !tokenResponse.accessToken) {
        throw new Error('Central token response missing email/accessToken');
      }

      // Log access flag for observability.
      const canAccess =
        centralUser.permissions?.[MCOM_PERMISSION_KEY] ??
        centralUser.permissions?.[MCOM_PERMISSION_KEY_LEGACY];
      this.logger.log(
        `SSO login ${centralUser.email} role=${centralUser.role ?? 'n/a'} canAccess=${String(canAccess)} ` +
          `plan=${centralUser.businessProfile?.appPlan?.planName ?? 'n/a'}`,
      );

      // Verify role eligibility: only agent, account manager, consultant (and admin) are permitted.
      const existingUser = await this.usersService.findByEmail(
        centralUser.email.toLowerCase(),
      );
      const roleToCheck = centralUser.role || existingUser?.role;
      let normalizedRole = this.mcomService.normalizeAffiliateRole(roleToCheck);

      if (!normalizedRole && !centralUser.role && canAccess) {
        normalizedRole = this.mcomService.normalizeAffiliateRole(existingUser?.role) ?? null;
      }

      if (!normalizedRole) {
        this.logger.warn(
          `SSO login denied for ${centralUser.email}: role '${roleToCheck ?? 'none'}' is not authorized for 247gbs affiliate`,
        );
        res.redirect(`${frontendUrl}/login?error=sso_unauthorized_role`);
        return;
      }

      const fullName =
        centralUser.name ??
        `${centralUser.firstName ?? ''} ${centralUser.lastName ?? ''}`.trim();

      const user = await this.mcomService.jitProvision({
        sub: centralUser.id,
        email: centralUser.email.toLowerCase(),
        name: fullName || centralUser.email,
        role: normalizedRole,
        membership: {
          level:
            centralUser.membershipLevel ??
            centralUser.businessProfile?.membershipLevel ??
            null,
          status:
            centralUser.membershipStatus ??
            centralUser.businessProfile?.membershipStatus ??
            null,
        },
        permissions: centralUser.permissions,
      });

      await this.mcomService.storeTokens(
        user.id,
        tokenResponse.accessToken,
        tokenResponse.refreshToken,
      );

      const localToken = this.jwtService.sign({
        email: user.email,
        sub: user.id,
        role: user.role,
        isOnboarded: user.isOnboarded,
      });

      const returnData = getReturnCookie(req);
      clearReturnCookie(res);

      const role = sanitizeRole(user.role);
      const redirectUrl =
        returnData?.redirect ||
        `${frontendUrl}/auth/callback?token=${encodeURIComponent(localToken)}&role=${encodeURIComponent(role)}`;
      res.redirect(redirectUrl);
    } catch (err: unknown) {
      const axiosData = (err as { response?: { data?: unknown; status?: number } })
        ?.response;
      const detail =
        (axiosData?.data as { message?: unknown } | undefined)?.message ??
        axiosData?.data ??
        (err as Error)?.message ??
        'unknown error';
      this.logger.error(
        `SSO token exchange failed (status ${axiosData?.status ?? 'n/a'}): ${JSON.stringify(detail)}`,
      );
      // In development, forward Central's message so the login page can
      // show it; in production keep the generic error code.
      const isProd = this.config.get<string>('NODE_ENV') === 'production';
      const detailStr = String(
        Array.isArray(detail) ? detail.join(', ') : detail,
      ).slice(0, 200);
      const suffix =
        !isProd && detailStr ? `&detail=${encodeURIComponent(detailStr)}` : '';
      res.redirect(`${frontendUrl}/login?error=sso_exchange_failed${suffix}`);
    }
  }

  // ── Refresh Central tokens + re-sync profile ──

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh Central Hub tokens' })
  async refresh(@Body('userId') userId: string): Promise<{ success: true }> {
    if (!userId) throw new UnauthorizedException('userId is required');
    const user = await this.usersService.findOne(userId);
    const tokens = this.mcomService.getDecryptedTokens(user);

    if (!tokens.refreshToken) {
      throw new UnauthorizedException('No refresh token available');
    }

    const refreshed = await this.mcomService.refreshTokens(tokens.refreshToken);
    await this.mcomService.storeTokens(
      user.id,
      refreshed.accessToken,
      refreshed.refreshToken,
    );

    try {
      const centralUser = await this.mcomService.getUserInfo(
        refreshed.accessToken,
      );
      await this.mcomService.jitProvision({
        sub: centralUser.id,
        email: centralUser.email.toLowerCase(),
        name: this.mcomService.resolveDisplayName(centralUser),
        role: centralUser.role,
        membership: {
          level: centralUser.membershipLevel ?? null,
          status: centralUser.membershipStatus ?? null,
        },
        permissions: centralUser.permissions,
      });
    } catch (err) {
      this.logger.warn(`Post-refresh userinfo sync failed: ${err}`);
    }

    return { success: true };
  }

  // ── Access status (membership metadata for display only) ──

  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Get Central Hub SSO status' })
  async status(
    @Query('userId') userId: string,
    @Query('sync') sync?: string,
  ): Promise<{
    connected: boolean;
    mcomUserId: string | null;
    membership: {
      level: string | null;
      tier: string | null;
      status: string | null;
      canAccessAffiliate: boolean;
    };
  }> {
    if (!userId) throw new UnauthorizedException('userId is required');
    let user = await this.usersService.findOne(userId);

    if (sync === '1' && user.mcomAccessToken) {
      const tokens = this.mcomService.getDecryptedTokens(user);
      if (tokens.accessToken) {
        try {
          const centralUser = await this.mcomService.getUserInfo(
            tokens.accessToken,
          );
          await this.mcomService.jitProvision({
            sub: centralUser.id,
            email: centralUser.email.toLowerCase(),
            name: this.mcomService.resolveDisplayName(centralUser),
            role: centralUser.role,
            membership: {
              level: centralUser.membershipLevel ?? null,
              status: centralUser.membershipStatus ?? null,
            },
            permissions: centralUser.permissions,
          });
        } catch {
          if (tokens.refreshToken) {
            try {
              const refreshed = await this.mcomService.refreshTokens(
                tokens.refreshToken,
              );
              await this.mcomService.storeTokens(
                user.id,
                refreshed.accessToken,
                refreshed.refreshToken,
              );
            } catch {
              // Refresh failed — status below still reflects stored state.
            }
          }
        }
        user = await this.usersService.findOne(userId);
      }
    }

    return {
      connected: Boolean(user.mcomUserId),
      mcomUserId: user.mcomUserId ?? null,
      membership: {
        level: user.mcomMembershipLevel ?? null,
        tier: user.mcomMembershipTier ?? null,
        status: user.mcomMembershipStatus ?? null,
        canAccessAffiliate: user.mcomCanAccessVcard ?? false,
      },
    };
  }

  // ── Public config for the web app ──

  @Public()
  @Get('config')
  @ApiOperation({ summary: 'Get Central Hub SSO public config' })
  getConfig(): {
    membershipUrl: string | undefined;
    walletEnabled: boolean;
    configured: boolean;
  } {
    const { solutionsUrl, clientId } = this.mcomService.ssoConfig;
    return {
      membershipUrl: this.config.get<string>('MCOM_MEMBERSHIP_URL'),
      walletEnabled:
        this.config.get<string>('MCOM_WALLET_ENABLED') === 'true',
      configured: Boolean(solutionsUrl && clientId),
    };
  }

  // ── HMAC-signed permissions lookup ──

  @Public()
  @Get('data/permissions')
  @ApiOperation({ summary: 'Fetch permissions from Central Hub' })
  async permissions(@Query('userId') userId: string): Promise<unknown> {
    if (!userId) throw new UnauthorizedException('userId is required');
    const user = await this.usersService.findOne(userId);
    if (!user.mcomUserId) {
      throw new UnauthorizedException('Not connected to Central Hub');
    }
    return this.mcomService.fetchPermissions(user.mcomUserId);
  }
}
