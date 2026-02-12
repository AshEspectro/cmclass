import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join, isAbsolute } from 'path';
import { PrismaService } from '../prisma/prisma.service';

export type InboundEmailListParams = {
  page: number;
  pageSize: number;
  search?: string;
  includeArchived?: boolean;
};

@Injectable()
export class InboundEmailService {
  constructor(private prisma: PrismaService) {}

  async list(params: InboundEmailListParams) {
    const page = Number(params.page) > 0 ? Number(params.page) : 1;
    const pageSize = Number(params.pageSize) > 0 ? Number(params.pageSize) : 20;
    const search = params.search?.trim();

    const includeArchived = !!params.includeArchived;
    const where: any = search
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

  async get(id: number) {
    return this.prisma.inboundEmail.findUnique({ where: { id } });
  }

  async archive(id: number, archived = true) {
    return this.prisma.inboundEmail.update({ where: { id }, data: { archived } });
  }

  async remove(id: number) {
    const record = await this.prisma.inboundEmail.findUnique({ where: { id } });
    if (!record) return null;
    await this.cleanupAttachments(record.attachments);
    await this.prisma.inboundEmail.delete({ where: { id } });
    return record;
  }

  private async cleanupAttachments(attachments: any) {
    if (!Array.isArray(attachments) || attachments.length === 0) return;
    const publicRoot = join(process.cwd(), 'public');
    await Promise.all(
      attachments.map(async (att: any) => {
        const storagePath = typeof att?.storagePath === 'string' ? att.storagePath : null;
        if (!storagePath) return;
        const absolutePath = isAbsolute(storagePath) ? storagePath : join(publicRoot, storagePath);
        try {
          await unlink(absolutePath);
        } catch {
          // ignore missing files
        }
      }),
    );
  }
}
