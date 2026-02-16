"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboundEmailService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const prisma_service_1 = require("../prisma/prisma.service");
let InboundEmailService = class InboundEmailService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(params) {
        const page = Number(params.page) > 0 ? Number(params.page) : 1;
        const pageSize = Number(params.pageSize) > 0 ? Number(params.pageSize) : 20;
        const search = params.search?.trim();
        const includeArchived = !!params.includeArchived;
        const where = search
            ? {
                OR: [
                    { subject: { contains: search, mode: 'insensitive' } },
                    { fromEmail: { contains: search, mode: 'insensitive' } },
                    { fromName: { contains: search, mode: 'insensitive' } },
                    { toEmails: { has: search } },
                    { ccEmails: { has: search } },
                ],
            }
            : {};
        if (!includeArchived) {
            where.archived = false;
        }
        const [total, data] = await this.prisma.$transaction([
            this.prisma.inboundEmail.count({ where }),
            this.prisma.inboundEmail.findMany({
                where,
                orderBy: [{ receivedAt: 'desc' }, { createdAt: 'desc' }],
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: {
                    id: true,
                    subject: true,
                    fromName: true,
                    fromEmail: true,
                    toEmails: true,
                    ccEmails: true,
                    protocol: true,
                    mailbox: true,
                    receivedAt: true,
                    createdAt: true,
                    archived: true,
                    text: true,
                },
            }),
        ]);
        const mapped = data.map((row) => {
            const preview = (row.text || '')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 160);
            const { text, ...rest } = row;
            return {
                ...rest,
                preview,
            };
        });
        return {
            data: mapped,
            meta: { page, pageSize, total },
        };
    }
    async get(id) {
        return this.prisma.inboundEmail.findUnique({ where: { id } });
    }
    async archive(id, archived = true) {
        return this.prisma.inboundEmail.update({ where: { id }, data: { archived } });
    }
    async remove(id) {
        const record = await this.prisma.inboundEmail.findUnique({ where: { id } });
        if (!record)
            return null;
        await this.cleanupAttachments(record.attachments);
        await this.prisma.inboundEmail.delete({ where: { id } });
        return record;
    }
    async cleanupAttachments(attachments) {
        if (!Array.isArray(attachments) || attachments.length === 0)
            return;
        const publicRoot = (0, path_1.join)(process.cwd(), 'public');
        await Promise.all(attachments.map(async (att) => {
            const storagePath = typeof att?.storagePath === 'string' ? att.storagePath : null;
            if (!storagePath)
                return;
            const absolutePath = (0, path_1.isAbsolute)(storagePath) ? storagePath : (0, path_1.join)(publicRoot, storagePath);
            try {
                await (0, promises_1.unlink)(absolutePath);
            }
            catch {
                // ignore missing files
            }
        }));
    }
};
exports.InboundEmailService = InboundEmailService;
exports.InboundEmailService = InboundEmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InboundEmailService);
