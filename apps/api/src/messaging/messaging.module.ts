import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { CentralChatClient } from './central-chat.client';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { McomModule } from '../mcom/mcom.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, User]),
    HttpModule,
    UsersModule,
    McomModule,
  ],
  controllers: [MessagingController],
  providers: [MessagingService, CentralChatClient],
  exports: [MessagingService, CentralChatClient],
})
export class MessagingModule {}
