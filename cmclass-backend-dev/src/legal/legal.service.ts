import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LegalService {
    constructor(private prisma: PrismaService) { }

    async getAll() {
        return this.prisma.legalContent.findMany({
            orderBy: { type: 'asc' },
        });
    }

    async getByType(type: string) {
        const item = await this.prisma.legalContent.findUnique({
            where: { type },
        });
        if (!item) {
            // Return a default empty object or throw
            return { type, title: '', content: '' };
        }
        return item;
    }

    async upsert(type: string, title: string, content: string) {
        return this.prisma.legalContent.upsert({
            where: { type },
            update: { title, content },
            create: { type, title, content },
        });
    }
}
