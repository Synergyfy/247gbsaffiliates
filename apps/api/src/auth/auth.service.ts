import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

type SafeUser = Omit<User, 'password' | 'mcomAccessToken' | 'mcomRefreshToken' | 'currentHashedRefreshToken'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /** Validate email/password. Returns user without secrets, or null. */
  async validateUser(email: string, pass: string): Promise<SafeUser | null> {
    const normalized = email?.toLowerCase().trim();
    if (!normalized || !pass) return null;
    const user = await this.usersService.findByEmail(normalized);
    if (!user?.password) return null;
    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) return null;
    const {
      password: _password,
      mcomAccessToken: _a,
      mcomRefreshToken: _r,
      currentHashedRefreshToken: _c,
      ...result
    } = user;
    return result as SafeUser;
  }

  async login(user: SafeUser): Promise<{ access_token: string; user: SafeUser }> {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      isOnboarded: user.isOnboarded,
    };
    return { access_token: this.jwtService.sign(payload), user };
  }
}
