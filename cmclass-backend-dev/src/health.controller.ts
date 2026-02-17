import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
    @Get()
    root() {
        return { status: 'ok', message: 'CM Class API is running' };
    }

    @Get('health')
    health() {
        return { status: 'healthy', timestamp: new Date().toISOString() };
    }
}
