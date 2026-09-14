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
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isSsl = String(configService.get('DB_SSL')).toLowerCase() === 'true';
        const isSync = String(configService.get('DB_SYNC')).toLowerCase() === 'true';
        const port = Number(configService.get('DB_PORT') ?? 5432);

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST') ?? 'localhost',
          port,
          username: configService.get<string>('DB_USERNAME') ?? 'postgres',
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME') ?? '247gbs-affiliate',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: isSync, // Set to false in production
          logging: configService.get<string>('NODE_ENV') === 'development',
          ssl: isSsl ? { rejectUnauthorized: false } : false,
        };
      },
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
