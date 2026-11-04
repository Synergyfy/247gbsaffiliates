'use client';

import { io, Socket } from 'socket.io-client';
import apiClient from '@/lib/apiClient';

export type ConnectionState =
  | 'DISABLED'
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'SUSPENDED'
  | 'CLOSING';

export type ConnectionStateListener = (state: ConnectionState) => void;

export interface ChatSocketSession {
  enabled: boolean;
  socketUrl: string;
  socketToken: string;
  expiresIn: number;
  transport: 'websocket';
  reason?: string;
}

/**
 * Single Socket.IO connection to Central Hub chat.
 *
 * Tokens are fetched on every (re)connect via the 247GBS backend. They are
 * short-lived (90s) and single-use, and never touch localStorage.
 */
class ChatConnectionManager {
  private socket: Socket | null = null;
  private state: ConnectionState = 'DISCONNECTED';
  private stateListeners = new Set<ConnectionStateListener>();
  private customEventListeners = new Map<string, Set<(...args: any[]) => void>>();
  private session: ChatSocketSession | null = null;
  private sessionPromise: Promise<ChatSocketSession | null> | null = null;
  private disabledReason: string | null = null;
  private activeSubscribers = 0;
  private idleTimer: any = null;
  private readonly idleTimeoutMs = 120_000;

  getState(): ConnectionState {
    return this.state;
  }

  getDisabledReason(): string | null {
    return this.disabledReason;
  }

  private setState(next: ConnectionState) {
    if (this.state === next) return;
    this.state = next;
    this.stateListeners.forEach((listener) => {
      try {
        listener(next);
      } catch (error) {
        console.error('[ChatConnection] listener error:', error);
      }
    });
  }

  onStateChange(listener: ConnectionStateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => this.stateListeners.delete(listener);
  }

  private async fetchSession(): Promise<ChatSocketSession | null> {
    if (this.sessionPromise) return this.sessionPromise;

    this.sessionPromise = (async () => {
      try {
        const { data } = await apiClient.get<ChatSocketSession>('/messaging/chat-session');
        if (!data?.enabled || !data.socketToken || !data.socketUrl) {
          this.disabledReason = data?.reason || 'CENTRAL_ACCOUNT_NOT_CONNECTED';
          this.session = null;
          this.setState('DISABLED');
          return null;
        }
        this.disabledReason = null;
        this.session = data;
        return data;
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 401) {
          this.disabledReason = 'SIGNED_OUT';
          this.setState('DISABLED');
        }
        return null;
      } finally {
        this.sessionPromise = null;
      }
    })();

    return this.sessionPromise;
  }

  async connect(): Promise<Socket | null> {
    if (this.socket?.connected) return this.socket;
    if (this.state === 'CONNECTING') return this.socket;

    this.setState('CONNECTING');
    const session = await this.fetchSession();
    if (!session) {
      if (this.state !== 'DISABLED') this.setState('DISCONNECTED');
      return null;
    }

    // The token fetched above is used for the very first handshake; every
    // reconnect fetches a new one (single-use).
    let firstToken: string | null = session.socketToken;

    const socket = io(`${session.socketUrl}/chat`, {
      auth: (callback: (data: Record<string, unknown>) => void) => {
        if (firstToken) {
          const token = firstToken;
          firstToken = null;
          callback({ token });
          return;
        }
        this.fetchSession()
          .then((fresh) => callback(fresh ? { token: fresh.socketToken } : {}))
          .catch(() => callback({}));
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15000,
      randomizationFactor: 0.5,
      timeout: 20000,
      autoConnect: true,
    });

    this.socket = socket;
    this.setupSocketHandlers(socket);
    this.setupWindowLifecycle();
    return socket;
  }

  private setupSocketHandlers(socket: Socket) {
    socket.on('connect', () => {
      this.setState('CONNECTED');
      this.customEventListeners.forEach((listeners, event) => {
        listeners.forEach((listener) => socket.on(event, listener));
      });
    });

    socket.on('disconnect', (reason) => {
      this.setState(reason === 'io client disconnect' ? 'DISCONNECTED' : 'RECONNECTING');
    });

    socket.on('connect_error', (error) => {
      console.warn('[ChatConnection] connect_error:', error.message);
      if (/unauthorized|token|session revoked|not found/i.test(error.message)) {
        this.session = null;
        // Fetch a fresh token before the next attempt.
        void this.fetchSession();
      }
      this.setState('RECONNECTING');
    });

    socket.io.on('reconnect_attempt', () => {
      this.setState('RECONNECTING');
    });

    socket.io.on('reconnect_failed', () => {
      this.setState('DISCONNECTED');
    });
  }

  private setupWindowLifecycle() {
    if (typeof window === 'undefined' || (this as any).lifecycleBound) return;
    (this as any).lifecycleBound = true;

    const wake = () => {
      if (this.idleTimer) clearTimeout(this.idleTimer);
      if (this.state === 'SUSPENDED' || this.state === 'DISCONNECTED') {
        void this.connect();
      }
      this.idleTimer = setTimeout(() => {
        if (document.hidden && this.socket?.connected) {
          this.setState('SUSPENDED');
          this.socket.disconnect();
        }
      }, this.idleTimeoutMs);
    };

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') wake();
    });
    window.addEventListener('focus', wake);
    window.addEventListener('online', wake);
  }

  disconnect() {
    this.setState('CLOSING');
    if (this.idleTimer) clearTimeout(this.idleTimer);
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.setState('DISCONNECTED');
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }

  emit(event: string, data?: any, callback?: (response: any) => void) {
    const socket = this.socket;
    if (!socket?.connected) return false;
    if (callback) socket.emit(event, data, callback);
    else socket.emit(event, data);
    return true;
  }

  on(event: string, callback: (...args: any[]) => void): () => void {
    if (!this.customEventListeners.has(event)) {
      this.customEventListeners.set(event, new Set());
    }
    this.customEventListeners.get(event)!.add(callback);
    this.socket?.on(event, callback);

    return () => {
      this.customEventListeners.get(event)?.delete(callback);
      this.socket?.off(event, callback);
    };
  }

  subscribe(): () => void {
    this.activeSubscribers++;
    if (this.activeSubscribers === 1) {
      void this.connect();
    } else if (this.state === 'DISCONNECTED' || this.state === 'SUSPENDED') {
      // Another component mounted after the socket suspended/dropped — bring
      // it back instead of leaving the UI silently offline.
      void this.connect();
    }
    return () => {
      this.activeSubscribers = Math.max(0, this.activeSubscribers - 1);
    };
  }
}

export const chatConnection = new ChatConnectionManager();
