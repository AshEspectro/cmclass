import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const logger = new Logger('Bootstrap');

// Diagnostic: verify this file is being executed
console.log('main.ts: starting process');
process.on('exit', (code) => console.log('main.ts: process exit', code));

const normalizeOrigin = (value: string) =>
  value
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/\/+$/, '');

const parseEnvOrigins = (...values: Array<string | undefined>) =>
  values
    .flatMap((value) => (value ? value.split(',') : []))
    .map((value) => normalizeOrigin(value))
    .filter(Boolean);

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    // Respect reverse-proxy headers (x-forwarded-*) on Railway.
    app.set('trust proxy', 1);
    // parse cookies to support HttpOnly refresh token cookies
    app.use(require('cookie-parser')());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    const envOrigins = parseEnvOrigins(
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
      process.env.CORS_ORIGINS,
    );
    const localOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
    ];
    const allowedOrigins = Array.from(new Set([...envOrigins, ...localOrigins]));
    logger.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);

    app.enableCors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalizedOrigin = normalizeOrigin(origin);
        if (allowedOrigins.includes(normalizedOrigin)) return callback(null, true);
        if (process.env.NODE_ENV !== 'production') {
          if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
            return callback(null, true);
          }
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`), false);
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    app.enableShutdownHooks();

    // Serve uploads from the same absolute directory used by upload handlers.
    app.useStaticAssets(join(process.cwd(), 'public'));

    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    const host = process.env.HOST || '0.0.0.0';

    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection', reason);
    });

    process.on('uncaughtException', (err: any) => {
      logger.error('Uncaught Exception', err);
      process.exit(1);
    });

    await app.listen(port, host);
    logger.log(`Server listening on http://${host}:${port}`);

    const server: any = app.getHttpServer();
    if (server && typeof server.on === 'function') {
      server.on('error', (err: any) => {
        logger.error('HTTP server error', err);
        process.exit(1);
      });
    }
  } catch (err: any) {
    logger.error('Bootstrap failed', err);
    console.error(err);
    process.exit(1);
  }
}

bootstrap();
