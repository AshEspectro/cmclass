import { Controller, Get, Patch, Body, UseGuards, Param } from '@nestjs/common';
import { LegalService } from '../legal/legal.service';
import { UpdateLegalDto } from './dto/update-legal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/legal')
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminLegalController {
    constructor(private legalService: LegalService) { }

    @Get()
    async getAll() {
        return this.legalService.getAll();
    }

    @Get(':type')
    async getByType(@Param('type') type: string) {
        return this.legalService.getByType(type);
    }

    @Patch()
    async update(@Body() body: UpdateLegalDto) {
        return this.legalService.upsert(body.type, body.title, body.content);
    }
}
