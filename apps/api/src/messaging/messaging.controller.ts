import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messaging')
@Controller('messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Start a conversation', description: 'Authenticated user. Creates a new conversation with recipient.' })
  @ApiBody({ schema: { type: 'object', properties: { recipientId: { type: 'string', example: 'uuid-recipient' } } } })
  @ApiResponse({ status: 201, description: 'Conversation created', schema: { example: { id: 'uuid', participantIds: ['me', 'other'] } } })
  createConversation(@Request() req, @Body('recipientId') recipientId: string) {
    return this.messagingService.createConversation(req.user.userId, recipientId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get my conversations', description: 'Authenticated user. Returns list of conversations.' })
  @ApiResponse({ status: 200, description: 'List of conversations', schema: { example: [{ id: 'uuid', lastMessageContent: 'Hello' }] } })
  getMyConversations(@Request() req) {
    return this.messagingService.getMyConversations(req.user.userId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation', description: 'Authenticated user.' })
  @ApiResponse({ status: 200, description: 'List of messages', schema: { example: [{ id: 'uuid', content: 'Hello there', senderId: 'uuid' }] } })
  getMessages(@Param('id') id: string) {
    return this.messagingService.getMessages(id);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message', description: 'Authenticated user. Sends a message to existing conversation.' })
  @ApiBody({ schema: { type: 'object', properties: { content: { type: 'string', example: 'Hello, how are you?' } } } })
  @ApiResponse({ status: 201, description: 'Message sent', schema: { example: { id: 'uuid', content: 'Hello, how are you?' } } })
  sendMessage(@Request() req, @Param('id') id: string, @Body('content') content: string) {
    return this.messagingService.sendMessage(req.user.userId, id, content);
  }
}

