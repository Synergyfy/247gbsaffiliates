import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LocalJwtPayload {
  sub: string;
  email: string;
  role: string;
  isOnboarded?: boolean;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
    });
  }

  async validate(payload: LocalJwtPayload): Promise<{
    userId: string;
    email: string;
    role: string;
    isOnboarded?: boolean;
  }> {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      isOnboarded: payload.isOnboarded,
    };
  }
}
