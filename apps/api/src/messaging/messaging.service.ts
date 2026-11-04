import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CentralChatClient } from './central-chat.client';

/**
 * Messaging facade.
 *
 * - SSO-linked users (those with `mcomUserId`) are routed to Central Hub chat,
 *   which is the single source of truth shared with businesses.
 * - Users with no Central identity keep the original local messaging tables so
 *   nothing regresses while they connect their account.
 */
@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly users: UsersService,
    private readonly central: CentralChatClient,
  ) {}

  private async resolveUser(userId: string): Promise<User> {
    return this.users.findOne(userId);
  }

  private async useCentral(userId: string): Promise<User | null> {
    const user = await this.resolveUser(userId);
    return this.central.isEnabledFor(user) ? user : null;
  }

  async getChatSocketSession(userId: string) {
    const user = await this.resolveUser(userId);
    if (!this.central.isEnabledFor(user)) {
      return { enabled: false, reason: 'CENTRAL_ACCOUNT_NOT_CONNECTED' };
    }
    const session = await this.central.getSocketSession(userId);
    return { enabled: true, ...session };
  }

  async getConversations(userId: string) {
    const user = await this.useCentral(userId);
    if (user) return this.central.getConversations(user);
    return this.localGetConversations(userId);
  }

  async getMessages(userId: string, conversationId: string, cursor?: string, limit = 50) {
    const user = await this.useCentral(userId);
    if (user) return this.central.getMessages(user, conversationId, cursor, limit);
    return this.localGetMessages(conversationId);
  }

  async sendMessage(userId: string, conversationId: string, content: string, idempotencyKey?: string) {
    const user = await this.useCentral(userId);
    if (user) return this.central.sendMessage(user, conversationId, content, idempotencyKey);
    return this.localSendMessage(userId, conversationId, content);
  }

  async markRead(userId: string, conversationId: string, messageIds?: string[]) {
    const user = await this.useCentral(userId);
    if (user) return this.central.markRead(user, conversationId, messageIds);
    return { success: true, markedCount: 0 };
  }

  async createConversation(userId: string, recipientId: string) {
    const user = await this.useCentral(userId);
    if (user) return this.central.createDirectConversation(user, recipientId);
    return this.localCreateConversation(userId, recipientId);
  }

  async searchDirectory(userId: string, query: string) {
    const user = await this.useCentral(userId);
    if (!user) return [];
    return this.central.searchDirectory(user, query);
  }

  async getHealth(userId: string) {
    const user = await this.useCentral(userId);
    if (!user) {
      return {
        enabled: false,
        central: false,
        reason: 'CENTRAL_ACCOUNT_NOT_CONNECTED',
      };
    }
    const health = await this.central.getHealth(user);
    return { enabled: true, ...health };
  }

  // ─── Local fallback (legacy) ───────────────────────────────────────────────

  private async localCreateConversation(userId: string, recipientId: string) {
    const existing = await this.conversationRepo
      .createQueryBuilder('c')
      .where('c.participantIds LIKE :userId1', { userId1: `%${userId}%` })
      .andWhere('c.participantIds LIKE :userId2', { userId2: `%${recipientId}%` })
      .getOne();

    if (existing) {
      return this.localGetConversationWithParticipants(existing.id);
    }

    const participants = await this.userRepo.findBy({ id: In([userId, recipientId]) });

    const conversation = this.conversationRepo.create({
      participantIds: [userId, recipientId],
      participants,
    });
    const saved = await this.conversationRepo.save(conversation);
    return this.localGetConversationWithParticipants(saved.id);
  }

  private async localGetConversations(userId: string) {
    const conversations = await this.conversationRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.participants', 'participant')
      .where('c.participantIds LIKE :userId', { userId: `%${userId}%` })
      .orderBy('c.updatedAt', 'DESC')
      .getMany();

    return conversations.map((c) => this.mapLocalConversation(c));
  }

  private async localGetConversationWithParticipants(conversationId: string) {
    const conversation = await this.conversationRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.participants', 'participant')
      .where('c.id = :id', { id: conversationId })
      .getOne();

    if (!conversation) throw new NotFoundException('Conversation not found');
    return this.mapLocalConversation(conversation);
  }

  private mapLocalConversation(conversation: Conversation) {
    return {
      id: conversation.id,
      type: 'DIRECT',
      participantIds: conversation.participantIds,
      participants:
        conversation.participants?.map((participant) => ({
          id: participant.id,
          name:
            [participant.firstName, participant.lastName].filter(Boolean).join(' ') ||
            participant.email,
          firstName: participant.firstName,
          lastName: participant.lastName,
          email: participant.email,
          profileImage: participant.profileImage,
          role: participant.role,
          status: 'offline',
          isOnline: false,
        })) || [],
      lastMessageContent: conversation.lastMessageContent || null,
      lastMessageAt: conversation.updatedAt,
      updatedAt: conversation.updatedAt,
      unreadCount: 0,
      isMuted: false,
      isOnline: false,
    };
  }

  private async localGetMessages(conversationId: string) {
    return this.messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  private async localSendMessage(senderId: string, conversationId: string, content: string) {
    const conversation = await this.conversationRepo.findOne({ where: { id: conversationId } });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const message = this.messageRepo.create({
      conversationId,
      senderId,
      content,
    });

    await this.messageRepo.save(message);

    conversation.lastMessageContent = content;
    await this.conversationRepo.save(conversation);

    return message;
  }
}
