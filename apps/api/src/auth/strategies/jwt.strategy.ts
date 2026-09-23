import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { AUTH_COOKIE } from '../auth-cookie.util';

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
      jwtFromRequest: ExtractJwt.fromExtractors([
        // 1. Primary: Extract from HttpOnly cookie
        (req: Request) => {
          if (req && req.cookies) {
            return req.cookies[AUTH_COOKIE] || req.cookies['access_token'] || null;
          }
          return null;
        },
        // 2. Secondary fallback: Bearer token header
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
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
