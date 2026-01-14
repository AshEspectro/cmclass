import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const logger = new Logger('Bootstrap');

// Diagnostic: verify this file is being executed
console.log('main.ts: starting process');
process.on('exit', (code) => console.log('main.ts: process exit', code));

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    // parse cookies to support HttpOnly refresh token cookies
    app.use(require('cookie-parser')());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.enableCors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    });

    app.enableShutdownHooks();

    // serve uploaded assets from /public
    app.useStaticAssets(join(__dirname, '..', 'public'));

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
