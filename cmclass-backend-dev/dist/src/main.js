"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const logger = new common_1.Logger('Bootstrap');
// Diagnostic: verify this file is being executed
console.log('main.ts: starting process');
process.on('exit', (code) => console.log('main.ts: process exit', code));
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        // parse cookies to support HttpOnly refresh token cookies
        app.use(require('cookie-parser')());
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true }));
        const envOrigins = [
            process.env.FRONTEND_URL,
            process.env.ADMIN_URL,
        ].filter(Boolean);
        const localOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
        ];
        const allowedOrigins = Array.from(new Set([...envOrigins, ...localOrigins]));
        app.enableCors({
            origin: (origin, callback) => {
                if (!origin)
                    return callback(null, true);
                if (allowedOrigins.includes(origin))
                    return callback(null, true);
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
        // serve uploaded assets from /public
        app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'));
        const port = process.env.PORT ? Number(process.env.PORT) : 3000;
        const host = process.env.HOST || '0.0.0.0';
        process.on('unhandledRejection', (reason) => {
            logger.error('Unhandled Rejection', reason);
        });
        process.on('uncaughtException', (err) => {
            logger.error('Uncaught Exception', err);
            process.exit(1);
        });
        await app.listen(port, host);
        logger.log(`Server listening on http://${host}:${port}`);
        const server = app.getHttpServer();
        if (server && typeof server.on === 'function') {
            server.on('error', (err) => {
                logger.error('HTTP server error', err);
                process.exit(1);
            });
        }
    }
    catch (err) {
        logger.error('Bootstrap failed', err);
        console.error(err);
        process.exit(1);
    }
}
bootstrap();
