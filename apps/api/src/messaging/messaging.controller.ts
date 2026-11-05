import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messaging')
@Controller('messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('chat-session')
  @ApiOperation({
    summary: 'Get short-lived socket credentials for Central Hub chat',
    description:
      'Authenticated user. Returns a 90-second, single-use socket token. The browser connects directly to Central Hub; no long-lived token is exposed.',
  })
  getChatSession(@Request() req) {
    return this.messagingService.getChatSocketSession(req.user.userId);
  }

  @Get('health')
  @ApiOperation({ summary: 'Messaging bridge health for the current user' })
  getHealth(@Request() req) {
    return this.messagingService.getHealth(req.user.userId);
  }

  @Get('directory')
  @ApiOperation({ summary: 'Search businesses and members to start a conversation' })
  searchDirectory(@Request() req, @Query('q') q?: string) {
    return this.messagingService.searchDirectory(req.user.userId, q || '');
  }

  @Post('conversations')
  @ApiOperation({
    summary: 'Start a conversation',
    description:
      'Authenticated user. For SSO-linked users `recipientId` is the Central Hub user id from the directory endpoint.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { recipientId: { type: 'string', example: 'central-user-uuid' } },
      required: ['recipientId'],
    },
  })
  @ApiResponse({ status: 201, description: 'Conversation created or restored' })
  createConversation(@Request() req, @Body('recipientId') recipientId: string) {
    return this.messagingService.createConversation(req.user.userId, recipientId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get my conversations' })
  getMyConversations(@Request() req) {
    return this.messagingService.getConversations(req.user.userId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation (cursor paginated)' })
  getMessages(
    @Request() req,
    @Param('id') id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const parsed = limit ? Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100) : 50;
    return this.messagingService.getMessages(req.user.userId, id, cursor, parsed);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message (HTTP fallback when the socket is down)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', example: 'Hello, how are you?' },
        idempotencyKey: { type: 'string', example: 'client-temp-id' },
      },
      required: ['content'],
    },
  })
  sendMessage(
    @Request() req,
    @Param('id') id: string,
    @Body('content') content: string,
    @Body('idempotencyKey') idempotencyKey?: string,
  ) {
    return this.messagingService.sendMessage(req.user.userId, id, content, idempotencyKey);
  }

  @Post('conversations/:id/read')
  @ApiOperation({ summary: 'Mark messages in a conversation as read' })
  markRead(
    @Request() req,
    @Param('id') id: string,
    @Body('messageIds') messageIds?: string[],
  ) {
    return this.messagingService.markRead(req.user.userId, id, messageIds);
  }
}
