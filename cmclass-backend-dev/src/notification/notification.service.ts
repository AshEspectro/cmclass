import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  list(unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: unreadOnly ? { read: false } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { title: string; message: string; type?: string }) {
    return this.prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || 'INFO',
      },
    });
  }

  async markRead(id: number, read = true) {
    return this.prisma.notification.update({
      where: { id },
      data: { read },
    });
  }

  async delete(id: number) {
    await this.prisma.notification.delete({ where: { id } });
  }

  async summary() {
    const [unread, latest] = await Promise.all([
      this.prisma.notification.count({ where: { read: false } }),
      this.prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 4 }),
    ]);
    return { unread, latest };
  }
}
