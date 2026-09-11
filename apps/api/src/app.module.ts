import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SkillsModule } from './skills/skills.module';
import { AssessmentModule } from './assessment/assessment.module';
import { VerificationModule } from './verification/verification.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { TasksModule } from './tasks/tasks.module';
import { WalletModule } from './wallet/wallet.module';
import { MessagingModule } from './messaging/messaging.module';
import { CategoriesModule } from './categories/categories.module';
import { SectorsModule } from './sectors/sectors.module';
import { AccountManagerModule } from './account-manager/account-manager.module';
import { AdminModule } from './admin/admin.module';
import { LearningModule } from './learning/learning.module';
import { McomModule } from './mcom/mcom.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNC'), // Set to false in production
        logging: configService.get<string>('NODE_ENV') === 'development',
        ssl: configService.get<boolean>('DB_SSL') ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    SkillsModule,
    AssessmentModule,
    VerificationModule,
    TasksModule,
    WalletModule,
    MessagingModule,
    CategoriesModule,
    SectorsModule,
    AccountManagerModule,
    AdminModule,
    LearningModule,
    McomModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
