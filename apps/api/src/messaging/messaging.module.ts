import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, User])],
  controllers: [MessagingController],
  providers: [MessagingService],
})
export class MessagingModule {}
