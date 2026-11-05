import {
  ForbiddenException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { McomService } from '../mcom/mcom.service';

interface ChatSessionResponse {
  accessToken: string;
  expiresIn: number;
  socketToken: string;
  socketExpiresIn: number;
  userId: string;
}

export interface ChatSocketSession {
  socketUrl: string;
  socketToken: string;
  expiresIn: number;
  transport: 'websocket';
}

interface CentralParticipant {
  userId: string;
  role?: string;
  displayName?: string;
  email?: string;
  roleTitle?: string;
  isOnline?: boolean;
  lastReadAt?: string | null;
}

export interface CentralConversation {
  id: string;
  type: string;
  title?: string | null;
  avatarUrl?: string | null;
  lastMessageAt?: string;
  lastMessageText?: string | null;
  lastMessageSenderId?: string | null;
  unreadCount?: number;
  isMuted?: boolean;
  isOnline?: boolean;
  participants?: CentralParticipant[];
}

export interface CentralMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  senderRole?: string;
  senderAvatar?: string | null;
  content: string;
  type?: string;
  metadata?: unknown;
  createdAt: string;
  isSender?: boolean;
  readCount?: number;
  isReadByMe?: boolean;
}

/**
 * Server-to-server client for Central Hub chat.
 *
 * The browser never receives a long-lived Central token:
 *  - REST calls happen here using a 15-minute scoped chat access token that is
 *    cached in memory per user;
 *  - only the 90-second, single-use socket token is returned to the browser.
 */
@Injectable()
export class CentralChatClient {
  private readonly logger = new Logger(CentralChatClient.name);
  private readonly sessionCache = new Map<
    string,
    { accessToken: string; expiresAt: number }
  >();

  /** Bounded in-memory token cache (one entry per active chat user). */
  private cacheSession(userId: string, accessToken: string, expiresAt: number): void {
    if (this.sessionCache.size > 5000) {
      const oldest = this.sessionCache.keys().next().value;
      if (oldest) this.sessionCache.delete(oldest);
    }
    this.sessionCache.set(userId, { accessToken, expiresAt });
  }

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
    private readonly users: UsersService,
    private readonly mcom: McomService,
  ) {}

  // ── Configuration ──────────────────────────────────────────────────────────

  private get baseUrl(): string {
    return (this.config.get<string>('MCOM_SOLUTIONS_URL') || '').replace(/\/+$/, '');
  }

  private get clientId(): string {
    return this.config.get<string>('MCOM_CLIENT_ID') || '';
  }

  private get clientSecret(): string {
    return this.config.get<string>('MCOM_CLIENT_SECRET') || '';
  }

  private get enabled(): boolean {
    return Boolean(this.baseUrl && this.clientId && this.clientSecret);
  }

  private get basicAuth(): string {
    return `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`;
  }

  private get socketUrl(): string {
    return (
      this.config.get<string>('MCOM_CENTRAL_SOCKET_URL') ||
      this.baseUrl.replace(/\/api\/v1\/?$/, '')
    ).replace(/\/+$/, '');
  }

  /** True when this user can use Central Hub messaging (SSO-linked). */
  isEnabledFor(user: Pick<User, 'mcomUserId'>): boolean {
    return this.enabled && Boolean(user.mcomUserId);
  }

  // ── Token handling ─────────────────────────────────────────────────────────

  private decodeExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64url').toString('utf8'),
      );
      return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private async getValidSsoToken(userId: string): Promise<string> {
    const user = await this.users.findOne(userId);
    if (!user.mcomUserId) {
      throw new ForbiddenException(
        'Connect your Central Hub account to use messaging with businesses.',
      );
    }

    const tokens = this.mcom.getDecryptedTokens(user);
    if (!tokens.accessToken) {
      throw new ForbiddenException(
        'Your Central Hub session has expired. Please sign in again.',
      );
    }

    const expiry = this.decodeExpiry(tokens.accessToken);
    const expiresSoon = expiry !== null && expiry - Date.now() < 60_000;

    if (expiresSoon && tokens.refreshToken) {
      try {
        const refreshed = await this.mcom.refreshTokens(tokens.refreshToken);
        await this.mcom.storeTokens(
          user.id,
          refreshed.accessToken,
          refreshed.refreshToken,
        );
        return refreshed.accessToken;
      } catch (error: any) {
        this.logger.warn(`Central token refresh failed for user ${user.id}: ${error?.message}`);
        throw new ForbiddenException(
          'Your Central Hub session has expired. Please sign in again.',
        );
      }
    }

    return tokens.accessToken;
  }

  private async mintSession(userId: string): Promise<ChatSessionResponse> {
    const subjectToken = await this.getValidSsoToken(userId);
    try {
      const { data } = await firstValueFrom(
        this.http.post<ChatSessionResponse>(
          `${this.baseUrl}/api/v1/chat/session`,
          { subject_token: subjectToken },
          {
            headers: { Authorization: this.basicAuth },
            timeout: 15000,
          },
        ),
      );
      return data;
    } catch (error: any) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        (status === 401 || status === 403
          ? 'Central Hub rejected the chat session request.'
          : 'Central Hub messaging is unavailable right now.');
      this.logger.warn(
        `Chat session mint failed for user ${userId} (status ${status ?? 'n/a'}): ${message}`,
      );
      throw new ServiceUnavailableException(message);
    }
  }

  private async ensureAccessToken(userId: string): Promise<string> {
    const cached = this.sessionCache.get(userId);
    if (cached && cached.expiresAt > Date.now() + 30_000) {
      return cached.accessToken;
    }

    const session = await this.mintSession(userId);
    const ttlMs = Math.max(60, session.expiresIn - 60) * 1000;
    this.cacheSession(userId, session.accessToken, Date.now() + ttlMs);
    return session.accessToken;
  }

  /**
   * Short-lived, single-use socket credentials for the browser.
   *
   * Reuses the cached chat access token and calls the lightweight
   * `/chat/socket-token` endpoint so browser reconnects never re-run
   * client-credential (bcrypt) verification on Central.
   */
  async getSocketSession(userId: string): Promise<ChatSocketSession> {
    const token = await this.ensureAccessToken(userId);
    try {
      const response = await firstValueFrom(
        this.http.post<{ socketToken: string; expiresIn: number }>(
          `${this.baseUrl}/api/v1/chat/socket-token`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
          },
        ),
      );
      return {
        socketUrl: this.socketUrl,
        socketToken: response.data.socketToken,
        expiresIn: response.data.expiresIn,
        transport: 'websocket',
      };
    } catch (error: any) {
      // The cached access token may have expired between calls.
      if (error?.response?.status === 401) {
        this.sessionCache.delete(userId);
        const session = await this.mintSession(userId);
        this.cacheSession(
          userId,
          session.accessToken,
          Date.now() + Math.max(60, session.expiresIn - 60) * 1000,
        );
        const retry = await firstValueFrom(
          this.http.post<{ socketToken: string; expiresIn: number }>(
            `${this.baseUrl}/api/v1/chat/socket-token`,
            {},
            {
              headers: { Authorization: `Bearer ${session.accessToken}` },
              timeout: 15000,
            },
          ),
        );
        return {
          socketUrl: this.socketUrl,
          socketToken: retry.data.socketToken,
          expiresIn: retry.data.expiresIn,
          transport: 'websocket',
        };
      }
      this.logger.warn(
        `Socket token mint failed for user ${userId}: ${error?.message}`,
      );
      throw new ServiceUnavailableException(
        'Central Hub messaging is unavailable right now.',
      );
    }
  }

  private async request<T>(
    userId: string,
    method: 'GET' | 'POST' | 'DELETE',
    path: string,
    data?: unknown,
    allowRetry = true,
  ): Promise<T> {
    const token = await this.ensureAccessToken(userId);
    try {
      const response = await firstValueFrom(
        this.http.request<T>({
          method,
          url: `${this.baseUrl}/api/v1${path}`,
          data,
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        }),
      );
      return response.data;
    } catch (error: any) {
      if (allowRetry && error?.response?.status === 401) {
        this.sessionCache.delete(userId);
        return this.request<T>(userId, method, path, data, false);
      }
      const message =
        error?.response?.data?.message ||
        'Central Hub messaging is unavailable right now.';
      this.logger.warn(
        `Central chat request failed [${method} ${path}] for ${userId}: ${message}`,
      );
      throw new ServiceUnavailableException(message);
    }
  }

  // ── Mapping helpers ────────────────────────────────────────────────────────

  private async localProfiles(mcomUserIds: string[]): Promise<Map<string, User>> {
    const users = await this.users.findByMcomUserIds(mcomUserIds);
    return new Map(users.filter((u) => u.mcomUserId).map((u) => [u.mcomUserId as string, u]));
  }

  private formatLocalName(user: User): string {
    return (
      [user.firstName, user.lastName].filter(Boolean).join(' ') ||
      user.email ||
      'Member'
    );
  }

  private async mapConversation(
    conversation: CentralConversation,
    viewerCentralId: string,
    profiles: Map<string, User>,
  ): Promise<Record<string, unknown>> {
    const participants = conversation.participants ?? [];
    const mappedParticipants = participants.map((participant) => {
      const local = profiles.get(participant.userId);
      const isViewer = participant.userId === viewerCentralId;
      return {
        id: local?.id ?? participant.userId,
        centralUserId: participant.userId,
        name: local ? this.formatLocalName(local) : participant.displayName || participant.email || 'Member',
        firstName: local?.firstName ?? null,
        lastName: local?.lastName ?? null,
        email: local?.email ?? participant.email ?? null,
        profileImage: local?.profileImage ?? null,
        role: local?.role ?? participant.role ?? 'member',
        roleTitle: participant.roleTitle ?? participant.role ?? 'Member',
        status: participant.isOnline ? 'online' : 'offline',
        isOnline: Boolean(participant.isOnline),
        lastReadAt: participant.lastReadAt ?? null,
        isViewer,
      };
    });

    const otherParticipant =
      mappedParticipants.find((participant) => !participant.isViewer) ||
      mappedParticipants[0] ||
      null;

    return {
      id: conversation.id,
      type: conversation.type,
      title: conversation.title ?? null,
      avatarUrl: conversation.avatarUrl ?? null,
      participantIds: mappedParticipants.map((participant) => participant.id),
      participants: mappedParticipants,
      // Central id of the viewing user — lets the client tell its own messages
      // apart in inbox events (which carry Central ids).
      viewerCentralId,
      // Legacy field used by the account-manager dashboard panel.
      participant: otherParticipant,
      lastMessageContent: conversation.lastMessageText ?? null,
      lastMessageAt: conversation.lastMessageAt ?? null,
      updatedAt: conversation.lastMessageAt ?? new Date().toISOString(),
      unreadCount: conversation.unreadCount ?? 0,
      isMuted: Boolean(conversation.isMuted),
      isOnline: Boolean(conversation.isOnline),
    };
  }

  private async mapMessage(
    message: CentralMessage,
    viewerCentralId: string,
    profiles: Map<string, User>,
  ): Promise<Record<string, unknown>> {
    const local = profiles.get(message.senderId);
    const isSender = message.senderId === viewerCentralId;
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: isSender ? local?.id ?? message.senderId : local?.id ?? message.senderId,
      senderName: local ? this.formatLocalName(local) : message.senderName ?? 'Member',
      senderRole: local?.role ?? message.senderRole ?? 'member',
      senderAvatar: local?.profileImage ?? message.senderAvatar ?? null,
      content: message.content,
      type: message.type ?? 'TEXT',
      metadata: message.metadata ?? null,
      createdAt: message.createdAt,
      isSender,
      isRead: Boolean(message.isReadByMe),
      readCount: message.readCount ?? 0,
    };
  }

  // ── Public API used by MessagingService ────────────────────────────────────

  async getConversations(user: User): Promise<Record<string, unknown>[]> {
    const conversations = await this.request<CentralConversation[]>(
      user.id,
      'GET',
      '/chat/conversations',
    );
    const mcomIds = conversations.flatMap((conversation) =>
      (conversation.participants ?? []).map((participant) => participant.userId),
    );
    const profiles = await this.localProfiles(mcomIds);
    const viewerCentralId = user.mcomUserId as string;
    return Promise.all(
      conversations.map((conversation) =>
        this.mapConversation(conversation, viewerCentralId, profiles),
      ),
    );
  }

  async getMessages(
    user: User,
    conversationId: string,
    cursor?: string,
    limit = 50,
  ): Promise<Record<string, unknown>[]> {
    const query = new URLSearchParams();
    if (cursor) query.set('cursor', cursor);
    if (limit) query.set('limit', String(limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';

    const messages = await this.request<CentralMessage[]>(
      user.id,
      'GET',
      `/chat/conversations/${encodeURIComponent(conversationId)}/messages${suffix}`,
    );
    const profiles = await this.localProfiles(messages.map((message) => message.senderId));
    const viewerCentralId = user.mcomUserId as string;
    return Promise.all(
      messages.map((message) => this.mapMessage(message, viewerCentralId, profiles)),
    );
  }

  async sendMessage(
    user: User,
    conversationId: string,
    content: string,
    idempotencyKey?: string,
  ): Promise<Record<string, unknown>> {
    const message = await this.request<CentralMessage>(
      user.id,
      'POST',
      `/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
      { content, idempotencyKey },
    );
    const profiles = await this.localProfiles([message.senderId]);
    return this.mapMessage(message, user.mcomUserId as string, profiles);
  }

  markRead(user: User, conversationId: string, messageIds?: string[]) {
    return this.request<unknown>(
      user.id,
      'POST',
      `/chat/conversations/${encodeURIComponent(conversationId)}/read`,
      { messageIds },
    );
  }

  async createDirectConversation(
    user: User,
    targetCentralUserId: string,
  ): Promise<Record<string, unknown>> {
    const conversation = await this.request<CentralConversation>(
      user.id,
      'POST',
      '/chat/conversations/direct',
      { targetUserId: targetCentralUserId },
    );
    const profiles = await this.localProfiles(
      (conversation.participants ?? []).map((participant) => participant.userId),
    );
    return this.mapConversation(conversation, user.mcomUserId as string, profiles);
  }

  async searchDirectory(user: User, query: string): Promise<Record<string, unknown>[]> {
    const suffix = query ? `?q=${encodeURIComponent(query)}` : '';
    const users = await this.request<
      Array<{
        id: string;
        email: string;
        firstName?: string | null;
        lastName?: string | null;
        role: string;
        businessName?: string | null;
        isOnline?: boolean;
      }>
    >(user.id, 'GET', `/chat/users${suffix}`);

    const profiles = await this.localProfiles(users.map((entry) => entry.id));
    return users.map((entry) => {
      const local = profiles.get(entry.id);
      return {
        id: entry.id,
        localUserId: local?.id ?? null,
        displayName:
          local
            ? this.formatLocalName(local)
            : entry.businessName ||
              [entry.firstName, entry.lastName].filter(Boolean).join(' ') ||
              entry.email,
        email: entry.email,
        role: entry.role,
        businessName: entry.businessName ?? null,
        profileImage: local?.profileImage ?? null,
        isOnline: Boolean(entry.isOnline),
      };
    });
  }

  async getHealth(user: User): Promise<{ central: boolean; error?: string }> {
    try {
      await this.ensureAccessToken(user.id);
      return { central: true };
    } catch (error: any) {
      return { central: false, error: error?.message || 'unavailable' };
    }
  }
}
