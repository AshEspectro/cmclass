import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import Pop3Command from 'node-pop3';
import { randomBytes } from 'crypto';
import { join, extname } from 'path';
import { PrismaService } from '../prisma/prisma.service';

type AddressLike = { name?: string; address?: string };

type ReceiverConfig = {
  enabled: boolean;
  protocol: 'imap' | 'pop3';
  host: string | undefined;
  port: number;
  tls: boolean;
  user: string | undefined;
  pass: string | undefined;
  mailbox: string;
  markSeen: boolean;
  pollIntervalMs: number;
  maxPerPoll: number;
};

@Injectable()
export class MailReceiverService implements OnModuleInit, OnModuleDestroy {
  private logger = new Logger(MailReceiverService.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private prisma: PrismaService) { }

  onModuleInit() {
    const cfg = this.getConfig();
    if (!cfg.enabled) {
      this.logger.log('Mail receiver disabled (MAIL_RECV_ENABLED=false)');
      return;
    }
    if (!cfg.host || !cfg.user || !cfg.pass) {
      this.logger.warn('Mail receiver missing host/user/pass; not starting');
      return;
    }

    this.logger.log(
      `Mail receiver starting: ${cfg.protocol.toUpperCase()} ${cfg.host}:${cfg.port} (${cfg.mailbox})`,
    );
    this.timer = setInterval(() => this.pollSafe(), cfg.pollIntervalMs);
    // Kick off a first poll shortly after startup
    setTimeout(() => this.pollSafe(), 2000);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private getConfig(): ReceiverConfig {
    const protocol = (process.env.MAIL_RECV_PROTOCOL || 'imap').toLowerCase() === 'pop3' ? 'pop3' : 'imap';
    const tlsRaw = (process.env.MAIL_RECV_TLS || 'true').toLowerCase();
    const tls = tlsRaw !== 'false';
    const portEnv = process.env.MAIL_RECV_PORT ? Number(process.env.MAIL_RECV_PORT) : undefined;
    const port = portEnv || (protocol === 'imap' ? 993 : 995);

    return {
      enabled: (process.env.MAIL_RECV_ENABLED || '').toLowerCase() === 'true',
      protocol,
      host: process.env.MAIL_RECV_HOST,
      port,
      tls,
      user: process.env.MAIL_RECV_USER,
      pass: process.env.MAIL_RECV_PASS,
      mailbox: process.env.MAIL_RECV_MAILBOX || 'INBOX',
      markSeen: (process.env.MAIL_RECV_MARK_SEEN || 'true').toLowerCase() !== 'false',
      pollIntervalMs: process.env.MAIL_RECV_POLL_INTERVAL_MS
        ? Number(process.env.MAIL_RECV_POLL_INTERVAL_MS)
        : 60000,
      maxPerPoll: process.env.MAIL_RECV_MAX_PER_POLL ? Number(process.env.MAIL_RECV_MAX_PER_POLL) : 25,
    };
  }

  private async pollSafe() {
    if (this.running) return;
    this.running = true;
    try {
      const cfg = this.getConfig();
      if (!cfg.enabled || !cfg.host || !cfg.user || !cfg.pass) return;
      if (cfg.protocol === 'imap') {
        await this.pollImap(cfg);
      } else {
        await this.pollPop3(cfg);
      }
    } catch (err) {
      this.logger.error('Mail receiver poll failed', err as any);
    } finally {
      this.running = false;
    }
  }

  private async pollImap(cfg: ReceiverConfig) {
    const client = new ImapFlow({
      host: cfg.host!,
      port: cfg.port,
      secure: cfg.tls,
      auth: { user: cfg.user!, pass: cfg.pass! },
    });

    client.on('error', (err) => {
      this.logger.error('ImapFlow Client Error', err);
    });

    await client.connect();
    let lock: any;
    try {
      lock = await client.getMailboxLock(cfg.mailbox);
      const uids = await client.search({ seen: false }, { uid: true });
      if (!uids || uids.length === 0) return;
      const limited = uids.slice(-cfg.maxPerPoll);
      const messages = await client.fetchAll(
        limited,
        {
          envelope: true,
          source: true,
          flags: true,
          internalDate: true,
        },
        { uid: true },
      );

      const uidsToMark: number[] = [];
      for (const msg of messages) {
        try {
          const internalDate =
            msg.internalDate instanceof Date
              ? msg.internalDate
              : msg.internalDate
                ? new Date(msg.internalDate as any)
                : undefined;
          const stored = await this.storeMessage({
            protocol: 'imap',
            sourceId: msg.uid ? String(msg.uid) : undefined,
            mailbox: cfg.mailbox,
            raw: msg.source,
            envelope: msg.envelope,
            internalDate,
          });
          if (stored && msg.uid) uidsToMark.push(msg.uid);
        } catch (err) {
          this.logger.warn(`Failed to process IMAP message ${msg.uid}: ${(err as Error).message}`);
        }
      }

      if (cfg.markSeen && uidsToMark.length) {
        await client.messageFlagsAdd(uidsToMark, ['\\Seen'], { uid: true });
      }
    } finally {
      if (lock) lock.release();
      await client.logout();
    }
  }

  private async pollPop3(cfg: ReceiverConfig) {
    const client = new Pop3Command({
      user: cfg.user!,
      password: cfg.pass!,
      host: cfg.host!,
      port: cfg.port,
      tls: cfg.tls,
      timeout: 60000,
    });

    try {
      await client.connect();
      const uidlList = await client.UIDL();
      if (!Array.isArray(uidlList) || uidlList.length === 0) return;

      const limited = uidlList.slice(-cfg.maxPerPoll);
      for (const [msgNumRaw, uidlRaw] of limited as any) {
        const msgNum = Number(msgNumRaw);
        const uidl = String(uidlRaw || '');
        if (!msgNum || !uidl) continue;

        const exists = await this.prisma.inboundEmail.findFirst({
          where: { protocol: 'pop3', sourceId: uidl, mailbox: cfg.mailbox },
        });
        if (exists) continue;

        try {
          const raw = await client.RETR(msgNum);
          await this.storeMessage({
            protocol: 'pop3',
            sourceId: uidl,
            mailbox: cfg.mailbox,
            raw,
          });
        } catch (err) {
          this.logger.warn(`Failed to process POP3 message ${msgNum}: ${(err as Error).message}`);
        }
      }
    } finally {
      try {
        await client.QUIT();
      } catch {
        // ignore
      }
    }
  }

  private async storeMessage(args: {
    protocol: 'imap' | 'pop3';
    sourceId?: string;
    mailbox: string;
    raw: Buffer | string;
    envelope?: any;
    internalDate?: Date;
  }): Promise<boolean> {
    const parsed = await simpleParser(args.raw);
    const from = this.firstAddress(parsed?.from?.value) || this.firstAddress(args.envelope?.from);
    const toList = this.addressList(parsed?.to?.value) || this.addressList(args.envelope?.to);
    const ccList = this.addressList(parsed?.cc?.value) || this.addressList(args.envelope?.cc);
    const subject = parsed.subject || args.envelope?.subject || null;
    const messageId = parsed.messageId || args.envelope?.messageId || null;
    const html = typeof parsed.html === 'string' ? parsed.html : parsed.html ? parsed.html.toString() : null;
    const or: any[] = [];
    if (messageId) or.push({ messageId });
    if (args.sourceId) or.push({ protocol: args.protocol, sourceId: args.sourceId, mailbox: args.mailbox });
    if (or.length) {
      const existing = await this.prisma.inboundEmail.findFirst({ where: { OR: or } });
      if (existing) return false;
    }

    const attachments = await this.saveAttachments(parsed.attachments);

    await this.prisma.inboundEmail.create({
      data: {
        messageId,
        sourceId: args.sourceId || null,
        protocol: args.protocol,
        mailbox: args.mailbox,
        fromName: from?.name || null,
        fromEmail: from?.address || null,
        toEmails: toList || [],
        ccEmails: ccList || [],
        subject,
        text: parsed.text || null,
        html,
        receivedAt: parsed.date || args.internalDate || null,
        attachments: attachments.length ? (attachments as any) : null,
      },
    });

    this.logger.log(`Inbound email stored (${args.protocol}${args.sourceId ? `:${args.sourceId}` : ''})`);
    return true;
  }

  private firstAddress(list?: AddressLike[] | null): AddressLike | null {
    if (!Array.isArray(list) || list.length === 0) return null;
    return list[0] || null;
  }

  private addressList(list?: AddressLike[] | null): string[] | null {
    if (!Array.isArray(list) || list.length === 0) return null;
    const items = list.map((item) => item.address).filter(Boolean) as string[];
    return items.length ? items : null;
  }

  private attachmentBaseDir() {
    return join(process.cwd(), 'public', 'uploads', 'mail');
  }

  private normalizeFilename(filename?: string | null, contentType?: string | null) {
    const fallbackExt = this.extensionFromContentType(contentType);
    const rawName = (filename || 'attachment').trim();
    const ext = extname(rawName) || (fallbackExt ? `.${fallbackExt}` : '.bin');
    const base = rawName.replace(ext, '') || 'attachment';
    const safeBase = base.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 60) || 'attachment';
    const suffix = randomBytes(6).toString('hex');
    return `${safeBase}-${suffix}${ext}`;
  }

  private extensionFromContentType(contentType?: string | null) {
    if (!contentType) return null;
    const type = contentType.toLowerCase();
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'text/html': 'html',
      'application/zip': 'zip',
    };
    return map[type] || null;
  }

  private async saveAttachments(attachments?: any[]) {
    if (!Array.isArray(attachments) || attachments.length === 0) return [];
    const day = new Date().toISOString().slice(0, 10);
    const baseDir = this.attachmentBaseDir();
    const relativeDir = join('uploads', 'mail', day);
    const absoluteDir = join(baseDir, day);
    await mkdir(absoluteDir, { recursive: true });

    const saved: any[] = [];
    for (const att of attachments) {
      try {
        const content = att?.content;
        if (!content) continue;
        const buffer = Buffer.isBuffer(content)
          ? content
          : typeof content === 'string'
            ? Buffer.from(content)
            : content instanceof Uint8Array
              ? Buffer.from(content)
              : null;
        if (!buffer) continue;
        const filename = this.normalizeFilename(att?.filename, att?.contentType);
        const relativePath = join(relativeDir, filename);
        const absolutePath = join(baseDir, day, filename);
        await writeFile(absolutePath, buffer);
        saved.push({
          filename: att?.filename || filename,
          contentType: att?.contentType || null,
          size: att?.size || buffer.length || null,
          contentId: att?.contentId || null,
          storagePath: relativePath.replace(/\\/g, '/'),
          url: `/${relativePath.replace(/\\/g, '/')}`,
        });
      } catch (err) {
        this.logger.warn(`Failed to store attachment: ${(err as Error).message}`);
      }
    }
    return saved;
  }
}
