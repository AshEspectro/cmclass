import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

// Diagnostic: verify this file is being executed
console.log('main.ts: starting process');
process.on('exit', (code) => console.log('main.ts: process exit', code));

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.enableCors();
    app.enableShutdownHooks();

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
