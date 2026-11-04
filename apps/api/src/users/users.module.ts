import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { InternalDirectoryController } from './internal-directory.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, InternalDirectoryController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
