import { of } from 'rxjs';
import { CentralChatClient } from './central-chat.client';

function fakeJwt(expiresInSeconds = 3600): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ sub: 'central-1', exp: Math.floor(Date.now() / 1000) + expiresInSeconds }),
  ).toString('base64url');
  return `${header}.${payload}.signature`;
}

describe('CentralChatClient', () => {
  let client: CentralChatClient;
  let http: any;
  let users: any;
  let mcom: any;

  const localUser: any = {
    id: 'local-1',
    email: 'agent@example.com',
    firstName: 'Local',
    lastName: 'Agent',
    role: 'agent',
    profileImage: 'avatar.png',
    mcomUserId: 'central-1',
  };

  beforeEach(() => {
    http = {
      post: jest
        .fn()
        .mockReturnValueOnce(
          of({
            data: {
              accessToken: 'chat-access-token',
              expiresIn: 900,
              socketToken: 'session-socket-token',
              socketExpiresIn: 90,
              userId: 'central-1',
            },
          }),
        )
        .mockReturnValueOnce(
          of({ data: { socketToken: 'socket-token-123', expiresIn: 90 } }),
        ),
      request: jest.fn(),
    };
    users = {
      findOne: jest.fn().mockResolvedValue(localUser),
      findByMcomUserIds: jest.fn().mockResolvedValue([localUser]),
    };
    mcom = {
      getDecryptedTokens: jest.fn().mockReturnValue({
        accessToken: fakeJwt(),
        refreshToken: 'refresh-token',
      }),
      refreshTokens: jest.fn(),
      storeTokens: jest.fn(),
    };

    const config = {
      get: jest.fn((key: string) => {
        if (key === 'MCOM_SOLUTIONS_URL') return 'http://central.test';
        if (key === 'MCOM_CLIENT_ID') return '247gbs-affiliate';
        if (key === 'MCOM_CLIENT_SECRET') return 'secret';
        if (key === 'MCOM_CENTRAL_SOCKET_URL') return 'http://central.test';
        return undefined;
      }),
    };

    client = new CentralChatClient(config as any, http, users, mcom);
  });

  it('returns only a short-lived socket token to the browser', async () => {
    const session = await client.getSocketSession('local-1');

    expect(session).toEqual({
      socketUrl: 'http://central.test',
      socketToken: 'socket-token-123',
      expiresIn: 90,
      transport: 'websocket',
    });
    expect(http.post).toHaveBeenNthCalledWith(
      1,
      'http://central.test/api/v1/chat/session',
      { subject_token: expect.any(String) },
      expect.objectContaining({
        headers: { Authorization: expect.stringMatching(/^Basic /) },
      }),
    );
    expect(http.post).toHaveBeenNthCalledWith(
      2,
      'http://central.test/api/v1/chat/socket-token',
      {},
      expect.objectContaining({
        headers: { Authorization: 'Bearer chat-access-token' },
      }),
    );
  });

  it('maps Central participants to local profiles', async () => {
    http.request.mockReturnValueOnce(
      of({
        data: [
          {
            id: 'conv-1',
            type: 'DIRECT',
            lastMessageAt: '2026-11-04T10:00:00.000Z',
            lastMessageText: 'Hi there',
            unreadCount: 2,
            participants: [
              { userId: 'central-1', role: 'AGENT', isOnline: true, roleTitle: 'Affiliate Agent' },
              { userId: 'central-2', role: 'BUSINESS', displayName: 'Acme Ltd', email: 'acme@example.com' },
            ],
          },
        ],
      }),
    );

    const conversations = await client.getConversations(localUser);

    expect(conversations).toHaveLength(1);
    expect(conversations[0]).toMatchObject({
      id: 'conv-1',
      lastMessageContent: 'Hi there',
      unreadCount: 2,
    });
    const participants = conversations[0].participants as any[];
    expect(participants[0]).toMatchObject({
      id: 'local-1',
      centralUserId: 'central-1',
      isViewer: true,
      isOnline: true,
    });
    expect(participants[1]).toMatchObject({
      id: 'central-2',
      name: 'Acme Ltd',
      role: 'BUSINESS',
    });
    expect(conversations[0].participant).toMatchObject({ id: 'central-2' });
  });

  it('maps a sent message to the local sender id', async () => {
    http.request.mockReturnValueOnce(
      of({
        data: [
          {
            id: 'msg-1',
            conversationId: 'conv-1',
            senderId: 'central-1',
            content: 'Hello',
            createdAt: '2026-11-04T10:01:00.000Z',
            isSender: true,
          },
        ],
      }),
    );

    const messages = await client.getMessages(localUser, 'conv-1');
    expect(messages[0]).toMatchObject({
      id: 'msg-1',
      senderId: 'local-1',
      senderName: 'Local Agent',
      isSender: true,
    });
  });

  it('returns an empty directory for users without a Central identity', async () => {
    users.findOne.mockResolvedValueOnce({ ...localUser, mcomUserId: null });
    await expect(client.searchDirectory({ ...localUser, mcomUserId: null }, 'acme')).rejects.toThrow(
      /Connect your Central Hub account/,
    );
  });
});
