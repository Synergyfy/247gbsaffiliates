import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { InternalDirectoryController } from './internal-directory.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Task } from '../tasks/entities/task.entity';
import { QuizAttempt } from '../assessment/entities/quiz_attempt.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Task, QuizAttempt]), WalletModule],
  controllers: [UsersController, InternalDirectoryController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
