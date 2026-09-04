import { Controller, Post, Body, UseGuards, Request, Get, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateAdminDto } from '../users/dto/create-admin.dto';
import { UserRole } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password', description: 'Public access. Returns a JWT access token.' })
  @ApiResponse({ status: 201, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    // LocalAuthGuard validates user using email/pass from body, populates req.user
    // We pass loginDto mainly for Swagger visibility here, though Guard uses it implicitly
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user', description: 'Public access. Register as Agent, Account Manager, or Consultant.' })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: CreateUserDto }) // Simplified type ref
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() createUserDto: CreateUserDto) {
    if (createUserDto.role === UserRole.ADMIN) {
      throw new ForbiddenException('Admin registration is not allowed via this endpoint. Use /auth/register/admin instead.');
    }
    return this.authService.register(createUserDto);
  }

  @Public()
  @Post('register/admin')
  @ApiOperation({ summary: 'Register a new admin', description: 'Public access. Registers an Admin user who is auto-onboarded.' })
  @ApiResponse({ status: 201, description: 'Admin successfully registered' })
  async registerAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.authService.registerAdmin(createAdminDto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile', description: 'Requires authentication. Returns the logged-in user profile.' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully', schema: { example: { id: 'uuid', email: 'test@example.com', role: 'agent' } } })
  getProfile(@Request() req) {
    return req.user;
  }
}



