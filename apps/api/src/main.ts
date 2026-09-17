import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { config as dotenvConfig } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

// Load .env before anything else
const candidates = [
  join(process.cwd(), 'apps', 'api', '.env'),
  join(process.cwd(), '.env'),
];
const envFile = candidates.find((p) => existsSync(p));
if (envFile) {
  dotenvConfig({ path: envFile });
}

console.log('[BOOT] CWD:', process.cwd());
console.log('[BOOT] env file found:', envFile);
console.log('[BOOT] MCOM_SOLUTIONS_URL:', process.env.MCOM_SOLUTIONS_URL);
console.log('[BOOT] JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET ? 'SET' : 'MISSING');
console.log('[BOOT] POSTGRES_HOST:', process.env.POSTGRES_HOST);
console.log('[BOOT] PORT:', process.env.PORT);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'https://247gbsaffiliates.centralhubsolution.com';

  app.enableCors({
    origin: [
      'http://localhost:3011',
      'http://localhost:3012',
      'http://192.168.1.67:3011',
      frontendUrl,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(cookieParser());

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('247Affiliate API')
    .setDescription('The backend API for MCOMMALL (Listeo) Affiliate Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
