import { Controller, Get, Param } from '@nestjs/common';
import { LegalService } from '../legal/legal.service';

@Controller('public/legal')
export class PublicLegalController {
    constructor(private legalService: LegalService) { }

    @Get(':type')
    async getByType(@Param('type') type: string) {
        return this.legalService.getByType(type);
    }
}
