import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createConversation(userId: string, recipientId: string) {
    const existing = await this.conversationRepo
      .createQueryBuilder('c')
      .where('c.participantIds LIKE :userId1', { userId1: `%${userId}%` })
      .andWhere('c.participantIds LIKE :userId2', { userId2: `%${recipientId}%` })
      .getOne();

    if (existing) {
      return this.getConversationWithParticipants(existing.id);
    }

    const participants = await this.userRepo.findBy({ id: In([userId, recipientId]) });

    const conversation = this.conversationRepo.create({
      participantIds: [userId, recipientId],
      participants,
    });
    const saved = await this.conversationRepo.save(conversation);
    return this.getConversationWithParticipants(saved.id);
  }

  async getMyConversations(userId: string) {
    const conversations = await this.conversationRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.participants', 'participant')
      .where('c.participantIds LIKE :userId', { userId: `%${userId}%` })
      .orderBy('c.updatedAt', 'DESC')
      .getMany();

    return conversations.map(c => ({
      ...c,
      participants: c.participants?.map(p => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        profileImage: p.profileImage,
        role: p.role,
      })) || [],
    }));
  }

  async getConversationWithParticipants(conversationId: string) {
    const conversation = await this.conversationRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.participants', 'participant')
      .where('c.id = :id', { id: conversationId })
      .getOne();

    if (!conversation) throw new NotFoundException('Conversation not found');

    return {
      ...conversation,
      participants: conversation.participants?.map(p => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        profileImage: p.profileImage,
        role: p.role,
      })) || [],
    };
  }

  async getMessages(conversationId: string) {
    return this.messageRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(senderId: string, conversationId: string, content: string) {
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