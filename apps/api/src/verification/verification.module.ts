import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { VerificationRequest } from './entities/verification_request.entity';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationRequest, User]),
    UsersModule,
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class VerificationModule {}
