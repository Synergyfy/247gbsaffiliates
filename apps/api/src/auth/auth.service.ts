import { Injectable, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CreateAdminDto } from '../users/dto/create-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role, isOnboarded: user.isOnboarded }; // Added isOnboarded to payload if needed
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    const payload = { email: user.email, sub: user.id, role: user.role, isOnboarded: user.isOnboarded };
    return {
      ...result,
      access_token: this.jwtService.sign(payload),
    };
  }

  async registerAdmin(createAdminDto: CreateAdminDto) {
    const expectedSecret = this.configService.get<string>('ADMIN_REGISTRATION_SECRET');
    if (!expectedSecret || createAdminDto.adminSecret !== expectedSecret) {
      throw new ForbiddenException('Invalid admin registration secret.');
    }
    
    const { adminSecret, ...userData } = createAdminDto;
    const user = await this.usersService.createAdmin(userData as any);
    const { password, ...result } = user;
    return result;
  }
}

