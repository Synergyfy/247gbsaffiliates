import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHmac, timingSafeEqual } from 'crypto';
import { verify as verifyJwt } from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { encryptMcomToken, decryptMcomToken } from './mcom-crypto.util';
import {
  ALLOWED_AFFILIATE_ROLES,
  JitProvisionInput,
  McomCentralUser,
  McomRefreshResponse,
  McomSsoConfig,
  McomTokenResponse,
  MCOM_PERMISSION_KEY,
  MCOM_PERMISSION_KEY_LEGACY,
} from './mcom.types';

interface HandshakeJwtPayload {
  sub?: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  membership?: { level?: string | null; status?: string | null };
  permissions?: Record<string, boolean>;
}

@Injectable()
export class McomService {
  private readonly logger = new Logger(McomService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
    private readonly usersService: UsersService,
  ) {}

  // ── Typed config access ──────────────────────────────────────────

  get ssoConfig(): McomSsoConfig {
    return {
      solutionsUrl: this.requireEnv('MCOM_SOLUTIONS_URL'),
      clientId: this.requireEnv('MCOM_CLIENT_ID'),
      clientSecret: this.requireEnv('MCOM_CLIENT_SECRET'),
      redirectUri: this.requireEnv('MCOM_REDIRECT_URI'),
      scopes:
        this.config.get<string>('MCOM_SCOPES') || 'profile email business',
      platformSlug:
        this.config.get<string>('MCOM_PLATFORM_SLUG') || '247gbs_affiliate',
      frontendUrl:
        this.config.get<string>('FRONTEND_URL') || 'http://localhost:7089',
    };
  }

  private requireEnv(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) throw new Error(`Missing required env var: ${key}`);
    return value;
  }

  private get baseUrl(): string {
    return this.ssoConfig.solutionsUrl.replace(/\/$/, '');
  }

  private get clientId(): string {
    return this.ssoConfig.clientId;
  }

  private get clientSecret(): string {
    return this.ssoConfig.clientSecret;
  }

  private get redirectUri(): string {
    return this.ssoConfig.redirectUri;
  }

  private get scopes(): string {
    return this.ssoConfig.scopes;
  }

  private get hmacSecret(): string {
    return this.config.get<string>('MCOM_HMAC_SECRET') ?? '';
  }

  /** Supports both the new `MCOM_API_KEY` name and the legacy `MCOM_SOLUTION_API_KEY`. */
  private get apiKey(): string {
    return (
      this.config.get<string>('MCOM_API_KEY') ??
      this.config.get<string>('MCOM_SOLUTION_API_KEY') ??
      ''
    );
  }

  private basicAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`;
  }

  // ── Step 1: Build Central authorize URL (32-byte state passed in) ──

  getAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes,
      state,
    });
    return `${this.baseUrl}/api/v1/auth/sso/authorize?${params.toString()}`;
  }

  // ── Step 2: Exchange authorization code for tokens + user profile ──
  // Central authenticates the client via Basic auth (clientId:clientSecret)
  // and rejects unknown body properties, so the body carries only
  // code + client_id + redirect_uri.

  async exchangeCode(code: string): Promise<McomTokenResponse> {
    const url = `${this.baseUrl}/api/v1/auth/sso/token`;
    const body = {
      client_id: this.clientId,
      code,
      redirect_uri: this.redirectUri,
    };
    const { data } = await firstValueFrom(
      this.http.post<McomTokenResponse>(url, body, {
        headers: { Authorization: this.basicAuthHeader() },
        timeout: 15000,
      }),
    );
    return data;
  }

  // ── Refresh an expired access token ──

  async refreshTokens(refreshToken: string): Promise<McomRefreshResponse> {
    const url = `${this.baseUrl}/api/v1/auth/sso/token/refresh`;
    const { data } = await firstValueFrom(
      this.http.post<McomRefreshResponse>(
        url,
        { refresh_token: refreshToken },
        { headers: { Authorization: this.basicAuthHeader() }, timeout: 15000 },
      ),
    );
    return data;
  }

  // ── Re-verify profile / entitlements without a full re-login ──

  async getUserInfo(accessToken: string): Promise<McomCentralUser> {
    const { data } = await firstValueFrom(
      this.http.get<McomCentralUser>(
        `${this.baseUrl}/api/v1/auth/sso/userinfo`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 15000,
        },
      ),
    );
    return data;
  }

  // ── Server-to-server check (spec Task 7 format) ──
  // GET /api/v1/data/user?userId=... with X-Service-Id / X-Timestamp / X-Signature
  // where signature = HMAC_SHA256(secret, `${serviceId}:${timestamp}`).

  async checkUserMembership(userId: string): Promise<unknown> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const serviceId = this.clientId;
    const signature = createHmac('sha256', this.hmacSecret)
      .update(`${serviceId}:${timestamp}`)
      .digest('hex');

    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}/api/v1/data/user`, {
        params: { userId },
        headers: {
          'X-Service-Id': serviceId,
          'X-Timestamp': timestamp,
          'X-Signature': signature,
        },
        timeout: 15000,
      }),
    );
    return data;
  }

  // ── Legacy HMAC-signed permissions lookup (kept for compatibility) ──

  async fetchPermissions(mcomUserId: string): Promise<unknown> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const path = `/api/v1/data/permissions`;
    const signature = createHmac('sha256', this.hmacSecret)
      .update(`${timestamp}:${path}`)
      .digest('hex');

    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}${path}`, {
        headers: {
          'X-Mcom-Client-ID': this.clientId,
          'X-Mcom-Signature': signature,
          'X-Mcom-Timestamp': timestamp,
          'X-Mcom-User-ID': mcomUserId,
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 15000,
      }),
    );
    return data;
  }

  // ── Verify shared-secret JWT (Central → dashboard handshake) ──

  verifyHandshakeJwt(token: string): HandshakeJwtPayload {
    const secret = this.config.get<string>('SSO_SECRET');
    if (!secret) throw new Error('Missing SSO_SECRET env var');
    return verifyJwt(token, secret, {
      issuer: 'mcom-central',
      algorithms: ['HS256'],
    }) as HandshakeJwtPayload;
  }

  // ── Encrypt and store Central tokens on the local user ──

  async storeTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    await this.usersService.update(userId, {
      mcomAccessToken: encryptMcomToken(accessToken),
      mcomRefreshToken: encryptMcomToken(refreshToken),
      mcomTokensUpdatedAt: new Date(),
    } as never);
  }

  getDecryptedTokens(user: {
    mcomAccessToken?: string | null;
    mcomRefreshToken?: string | null;
  }): { accessToken: string | null; refreshToken: string | null } {
    if (!user.mcomAccessToken || !user.mcomRefreshToken) {
      return { accessToken: null, refreshToken: null };
    }
    try {
      return {
        accessToken: decryptMcomToken(user.mcomAccessToken),
        refreshToken: decryptMcomToken(user.mcomRefreshToken),
      };
    } catch (err) {
      this.logger.warn(`Failed to decrypt stored MCOM tokens: ${err}`);
      return { accessToken: null, refreshToken: null };
    }
  }

  /**
   * Normalize an incoming role string to a valid UserRole.
   * Returns null if the role is not permitted to access 247gbs affiliate portal
   * (e.g. customers, consumers, clients, generic users).
   */
  normalizeAffiliateRole(role?: string | null): UserRole | null {
    if (!role) return null;
    const normalized = role.toLowerCase().trim().replace(/[\s-]+/g, '_');
    if (normalized === 'agent') return UserRole.AGENT;
    if (normalized === 'account_manager') return UserRole.ACCOUNT_MANAGER;
    if (normalized === 'consultant') return UserRole.CONSULTANT;
    if (normalized === 'admin' || normalized === 'administrator') return UserRole.ADMIN;
    return null;
  }

  // ── JIT provision / update local user from Central identity ──
  // 247GBS Affiliate access is restricted to agent, account_manager, consultant, and admin.

  async jitProvision(input: JitProvisionInput) {
    const permissions = input.permissions ?? {};
    const canAccess =
      permissions[MCOM_PERMISSION_KEY] ??
      permissions[MCOM_PERMISSION_KEY_LEGACY] ??
      true;

    const existing = await this.usersService.findByEmail(input.email);
    if (existing) {
      const normalizedRole = this.normalizeAffiliateRole(input.role);
      await this.usersService.update(existing.id, {
        mcomUserId: input.sub,
        ...(normalizedRole && { role: normalizedRole }),
        ...(input.membership && {
          mcomMembershipLevel: input.membership.level ?? null,
          mcomMembershipStatus: input.membership.status ?? null,
        }),
        mcomCanAccessVcard: Boolean(canAccess),
      } as never);
      return this.usersService.findOne(existing.id);
    }

    const assignedRole = this.normalizeAffiliateRole(input.role) || UserRole.AGENT;
    const nameParts = (input.name ?? '').trim().split(/\s+/).filter(Boolean);
    const created = await this.usersService.create({
      email: input.email,
      password: `sso-${Date.now()}-${Math.random().toString(36).slice(2, 14)}!A9`,
      firstName: nameParts[0] ?? '',
      lastName: nameParts.slice(1).join(' ') ?? '',
      role: assignedRole,
    });

    await this.usersService.update(created.id, {
      mcomUserId: input.sub,
      mcomMembershipLevel: input.membership?.level ?? null,
      mcomMembershipStatus: input.membership?.status ?? null,
      mcomCanAccessVcard: Boolean(canAccess),
    } as never);

    return this.usersService.findOne(created.id);
  }

  /** Extract display name from the various Central user shapes. */
  resolveDisplayName(user: McomCentralUser): string {
    if (user.name?.trim()) return user.name.trim();
    const full = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
    if (full) return full;
    return user.email;
  }

  // ── Webhook HMAC verification (constant-time compare) ──

  verifyWebhookSignature(
    payload: string,
    signature: string,
    timestamp: string,
  ): boolean {
    const secret = this.config.get<string>('MCOM_WEBHOOK_SECRET');
    if (!secret || !signature || !timestamp) return false;
    const expected = createHmac('sha256', secret)
      .update(`${timestamp}.${payload}`)
      .digest('hex');
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(signature.replace(/^sha256=/, ''), 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
