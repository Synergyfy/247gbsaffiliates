import { Controller, Get, Post, Body, Request, UseGuards, Patch, Param, Delete } from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('assessment')
@Controller('assessment')
@ApiBearerAuth()
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post('questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a quiz question', description: 'Admin only. Link to categories or global.' })
  @ApiResponse({ status: 201, description: 'Question created' })
  createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.assessmentService.createQuestion(createQuestionDto);
  }

  @Get('admin/questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List assessment questions with answer keys (admin only)' })
  getAdminQuestions() {
    return this.assessmentService.getAdminQuestions();
  }

  @Patch('questions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Edit an assessment question (admin only)' })
  updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.assessmentService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove an assessment question (admin only)' })
  deleteQuestion(@Param('id') id: string) {
    return this.assessmentService.deleteQuestion(id);
  }

  @Get('admin/attempts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Review affiliate assessment results (admin only)' })
  getAdminAttempts() {
    return this.assessmentService.getAdminAttempts();
  }

  @Get('quiz')
  @ApiOperation({ summary: 'Start a new quiz', description: 'Authenticated user. Returns random questions based on user sector/category context.' })
  @ApiResponse({ status: 200, description: 'Quiz questions', schema: { example: [{ id: 'uuid', text: 'Question 1?', options: ['A', 'B'] }] } })
  getQuiz(@Request() req) {
    return this.assessmentService.generateQuiz(req.user.userId);
  }

  @Get('latest-attempt')
  @ApiOperation({ summary: 'Get the current user’s latest assessment result' })
  @ApiResponse({ status: 200, description: 'Latest result, or null when no assessment has been submitted' })
  getLatestAttempt(@Request() req) {
    return this.assessmentService.getLatestAttempt(req.user.userId);
  }

  @Post('submit')
  @ApiOperation({ summary: 'Submit quiz answers', description: 'Authenticated user. Returns score and pass/fail status.' })
  @ApiBody({ schema: { type: 'object', properties: { answers: { type: 'array', items: { type: 'object', properties: { questionId: { type: 'string' }, selectedOptionIndex: { type: 'number' } } } } } } })
  @ApiResponse({ status: 201, description: 'Quiz result', schema: { example: { score: 8, maxScore: 10, percentage: 80, band: 'Partial' } } })
  submitQuiz(@Request() req, @Body() body: { answers: { questionId: string; selectedOptionIndex: number }[] }) {
    return this.assessmentService.submitQuiz(req.user.userId, body.answers);
  }
}



