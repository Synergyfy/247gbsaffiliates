import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHash, createHmac } from 'crypto';
import { UsersService } from '../users/users.service';
import { encryptMcomToken, decryptMcomToken } from './mcom-crypto.util';

@Injectable()
export class McomService {
  private readonly logger = new Logger(McomService.name);

  constructor(
    private config: ConfigService,
    private http: HttpService,
    private usersService: UsersService,
  ) {}

  private get baseUrl() {
    return this.config.get<string>('MCOM_SOLUTIONS_URL')!;
  }

  private get clientId() {
    return this.config.get<string>('MCOM_CLIENT_ID')!;
  }

  private get clientSecret() {
    return this.config.get<string>('MCOM_CLIENT_SECRET')!;
  }

  private get hmacSecret() {
    return this.config.get<string>('MCOM_HMAC_SECRET')!;
  }

  private get apiKey() {
    return this.config.get<string>('MCOM_SOLUTION_API_KEY')!;
  }

  private get redirectUri() {
    return this.config.get<string>('MCOM_REDIRECT_URI')!;
  }

  private get scopes() {
    return this.config.get<string>('MCOM_SCOPES') || 'profile email';
  }

  private get platformSlug() {
    return this.config.get<string>('MCOM_PLATFORM_SLUG')!;
  }

  // ── Build authorize URL ──

  getAuthorizeUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes,
      state,
    });
    return `${this.baseUrl}/authorize?${params.toString()}`;
  }

  // ── Exchange code for tokens ──

  async exchangeCode(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const { data } = await firstValueFrom(
      this.http.post(`${this.baseUrl}/oauth/token`, {
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    );
    return data;
  }

  // ── Refresh tokens ──

  async refreshTokens(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const { data } = await firstValueFrom(
      this.http.post(`${this.baseUrl}/oauth/token`, {
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      }),
    );
    return data;
  }

  // ── Fetch user info from Central ──

  async getUserInfo(accessToken: string): Promise<{
    sub: string;
    email: string;
    firstName?: string;
    lastName?: string;
    membership?: {
      level: string;
      tier: string;
      status: string;
      canAccessVcard: boolean;
    };
  }> {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}/api/userinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );
    return data;
  }

  // ── HMAC-signed server-to-server permissions ──

  async fetchPermissions(mcomUserId: string): Promise<any> {
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
      }),
    );
    return data;
  }

  // ── Get user packages from Central ──

  async getUserPackages(mcomUserId: string): Promise<any[]> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const path = `/api/v1/users/${mcomUserId}/packages`;
    const signature = createHmac('sha256', this.hmacSecret)
      .update(`${timestamp}:${path}`)
      .digest('hex');

    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}${path}`, {
        headers: {
          'X-Mcom-Client-ID': this.clientId,
          'X-Mcom-Signature': signature,
          'X-Mcom-Timestamp': timestamp,
          Authorization: `Bearer ${this.apiKey}`,
        },
      }),
    );
    return data;
  }

  // ── Verify shared-secret JWT (Direct Dashboard Handshake) ──

  verifyHandshakeJwt(token: string): any {
    const { verify } = require('jsonwebtoken');
    return verify(token, this.config.get<string>('SSO_SECRET')!, {
      issuer: 'mcom-central',
      algorithms: ['HS256'],
    });
  }

  // ── Encrypt and store tokens on user ──

  async storeTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expiresInSeconds: number,
  ) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);

    await this.usersService.update(userId, {
      mcomAccessToken: encryptMcomToken(accessToken),
      mcomRefreshToken: encryptMcomToken(refreshToken),
      mcomTokenExpiresAt: expiresAt,
      mcomTokensUpdatedAt: now,
    } as any);
  }

  // ── Decrypt stored tokens ──

  getDecryptedTokens(user: any): {
    accessToken: string | null;
    refreshToken: string | null;
  } {
    if (!user.mcomAccessToken || !user.mcomRefreshToken) {
      return { accessToken: null, refreshToken: null };
    }
    return {
      accessToken: decryptMcomToken(user.mcomAccessToken),
      refreshToken: decryptMcomToken(user.mcomRefreshToken),
    };
  }

  // ── JIT provision or update user from Central userinfo ──

  async jitProvision(centralUser: {
    sub: string;
    email: string;
    firstName?: string;
    lastName?: string;
    membership?: {
      level: string;
      tier: string;
      status: string;
      canAccessVcard: boolean;
    };
  }) {
    let user = await this.usersService.findByEmail(centralUser.email);

    if (user) {
      // Update existing user
      await this.usersService.update(user.id, {
        mcomUserId: centralUser.sub,
        ...(centralUser.membership && {
          mcomMembershipLevel: centralUser.membership.level,
          mcomMembershipTier: centralUser.membership.tier,
          mcomMembershipStatus: centralUser.membership.status,
          mcomCanAccessVcard: centralUser.membership.canAccessVcard,
        }),
      } as any);
      return this.usersService.findOne(user.id);
    }

    // Create new user via JIT provisioning (no password needed for SSO)
    const newUser = await this.usersService.create({
      email: centralUser.email,
      password: Math.random().toString(36).slice(-16) + '!' + Date.now(),
      firstName: centralUser.firstName || '',
      lastName: centralUser.lastName || '',
      role: 'agent' as any,
    });

    // Update with MCOM fields
    await this.usersService.update(newUser.id, {
      mcomUserId: centralUser.sub,
      mcomMembershipLevel: centralUser.membership?.level || null,
      mcomMembershipTier: centralUser.membership?.tier || null,
      mcomMembershipStatus: centralUser.membership?.status || null,
      mcomCanAccessVcard: centralUser.membership?.canAccessVcard || false,
    } as any);

    return this.usersService.findOne(newUser.id);
  }

  // ── HMAC signature verification for webhooks ──

  verifyWebhookSignature(payload: string, signature: string, timestamp: string): boolean {
    const expected = createHmac('sha256', this.config.get<string>('MCOM_WEBHOOK_SECRET')!)
      .update(`${timestamp}.${payload}`)
      .digest('hex');
    return expected === signature;
  }
}
