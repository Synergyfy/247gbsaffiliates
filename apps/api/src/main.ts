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
console.log('[BOOT] DB_HOST:', process.env.DB_HOST);
console.log('[BOOT] PORT:', process.env.PORT ?? '7088 (default)');
console.log('[BOOT] API_PREFIX:', process.env.API_PREFIX ?? 'api/v1 (default)');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // All configurable via apps/api/.env — change ports/paths there, no code edit needed.
  const port = Number(process.env.PORT ?? 7088);
  const host = process.env.HOST ?? '0.0.0.0';
  const apiPrefix = (process.env.API_PREFIX ?? 'api/v1').replace(/^\/+|\/+$/g, '');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:7089';
  // Comma-separated extra origins, e.g. CORS_ORIGINS=https://app.example.com,http://192.168.1.67:7089
  const extraOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: [
      'http://localhost:7089',
      'http://127.0.0.1:7089',
      'http://localhost:3011', // legacy dev port, kept for backward compat
      'http://192.168.1.67:7089',
      frontendUrl,
      ...extraOrigins,
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(cookieParser());

  // Global Prefix (configurable path)
  app.setGlobalPrefix(apiPrefix);

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
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.listen(port, host);
  console.log(`[BOOT] API listening on http://${host}:${port}/${apiPrefix}`);
}
bootstrap();
