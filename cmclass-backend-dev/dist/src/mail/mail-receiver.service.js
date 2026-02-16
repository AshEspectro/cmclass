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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MailReceiverService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailReceiverService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("fs/promises");
const imapflow_1 = require("imapflow");
const mailparser_1 = require("mailparser");
const node_pop3_1 = __importDefault(require("node-pop3"));
const crypto_1 = require("crypto");
const path_1 = require("path");
const prisma_service_1 = require("../prisma/prisma.service");
let MailReceiverService = MailReceiverService_1 = class MailReceiverService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MailReceiverService_1.name);
        this.timer = null;
        this.running = false;
    }
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
        this.logger.log(`Mail receiver starting: ${cfg.protocol.toUpperCase()} ${cfg.host}:${cfg.port} (${cfg.mailbox})`);
        this.timer = setInterval(() => this.pollSafe(), cfg.pollIntervalMs);
        // Kick off a first poll shortly after startup
        setTimeout(() => this.pollSafe(), 2000);
    }
    onModuleDestroy() {
        if (this.timer)
            clearInterval(this.timer);
    }
    getConfig() {
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
    async pollSafe() {
        if (this.running)
            return;
        this.running = true;
        try {
            const cfg = this.getConfig();
            if (!cfg.enabled || !cfg.host || !cfg.user || !cfg.pass)
                return;
            if (cfg.protocol === 'imap') {
                await this.pollImap(cfg);
            }
            else {
                await this.pollPop3(cfg);
            }
        }
        catch (err) {
            this.logger.error('Mail receiver poll failed', err);
        }
        finally {
            this.running = false;
        }
    }
    async pollImap(cfg) {
        const client = new imapflow_1.ImapFlow({
            host: cfg.host,
            port: cfg.port,
            secure: cfg.tls,
            auth: { user: cfg.user, pass: cfg.pass },
        });
        client.on('error', (err) => {
            this.logger.error('ImapFlow Client Error', err);
        });
        await client.connect();
        let lock;
        try {
            lock = await client.getMailboxLock(cfg.mailbox);
            const uids = await client.search({ seen: false }, { uid: true });
            if (!uids || uids.length === 0)
                return;
            const limited = uids.slice(-cfg.maxPerPoll);
            const messages = await client.fetchAll(limited, {
                envelope: true,
                source: true,
                flags: true,
                internalDate: true,
            }, { uid: true });
            const uidsToMark = [];
            for (const msg of messages) {
                try {
                    const internalDate = msg.internalDate instanceof Date
                        ? msg.internalDate
                        : msg.internalDate
                            ? new Date(msg.internalDate)
                            : undefined;
                    const stored = await this.storeMessage({
                        protocol: 'imap',
                        sourceId: msg.uid ? String(msg.uid) : undefined,
                        mailbox: cfg.mailbox,
                        raw: msg.source,
                        envelope: msg.envelope,
                        internalDate,
                    });
                    if (stored && msg.uid)
                        uidsToMark.push(msg.uid);
                }
                catch (err) {
                    this.logger.warn(`Failed to process IMAP message ${msg.uid}: ${err.message}`);
                }
            }
            if (cfg.markSeen && uidsToMark.length) {
                await client.messageFlagsAdd(uidsToMark, ['\\Seen'], { uid: true });
            }
        }
        finally {
            if (lock)
                lock.release();
            await client.logout();
        }
    }
    async pollPop3(cfg) {
        const client = new node_pop3_1.default({
            user: cfg.user,
            password: cfg.pass,
            host: cfg.host,
            port: cfg.port,
            tls: cfg.tls,
            timeout: 60000,
        });
        try {
            await client.connect();
            const uidlList = await client.UIDL();
            if (!Array.isArray(uidlList) || uidlList.length === 0)
                return;
            const limited = uidlList.slice(-cfg.maxPerPoll);
            for (const [msgNumRaw, uidlRaw] of limited) {
                const msgNum = Number(msgNumRaw);
                const uidl = String(uidlRaw || '');
                if (!msgNum || !uidl)
                    continue;
                const exists = await this.prisma.inboundEmail.findFirst({
                    where: { protocol: 'pop3', sourceId: uidl, mailbox: cfg.mailbox },
                });
                if (exists)
                    continue;
                try {
                    const raw = await client.RETR(msgNum);
                    await this.storeMessage({
                        protocol: 'pop3',
                        sourceId: uidl,
                        mailbox: cfg.mailbox,
                        raw,
                    });
                }
                catch (err) {
                    this.logger.warn(`Failed to process POP3 message ${msgNum}: ${err.message}`);
                }
            }
        }
        finally {
            try {
                await client.QUIT();
            }
            catch {
                // ignore
            }
        }
    }
    async storeMessage(args) {
        const parsed = await (0, mailparser_1.simpleParser)(args.raw);
        const from = this.firstAddress(parsed?.from?.value) || this.firstAddress(args.envelope?.from);
        const toList = this.addressList(parsed?.to?.value) || this.addressList(args.envelope?.to);
        const ccList = this.addressList(parsed?.cc?.value) || this.addressList(args.envelope?.cc);
        const subject = parsed.subject || args.envelope?.subject || null;
        const messageId = parsed.messageId || args.envelope?.messageId || null;
        const html = typeof parsed.html === 'string' ? parsed.html : parsed.html ? parsed.html.toString() : null;
        const or = [];
        if (messageId)
            or.push({ messageId });
        if (args.sourceId)
            or.push({ protocol: args.protocol, sourceId: args.sourceId, mailbox: args.mailbox });
        if (or.length) {
            const existing = await this.prisma.inboundEmail.findFirst({ where: { OR: or } });
            if (existing)
                return false;
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
                attachments: attachments.length ? attachments : null,
            },
        });
        this.logger.log(`Inbound email stored (${args.protocol}${args.sourceId ? `:${args.sourceId}` : ''})`);
        return true;
    }
    firstAddress(list) {
        if (!Array.isArray(list) || list.length === 0)
            return null;
        return list[0] || null;
    }
    addressList(list) {
        if (!Array.isArray(list) || list.length === 0)
            return null;
        const items = list.map((item) => item.address).filter(Boolean);
        return items.length ? items : null;
    }
    attachmentBaseDir() {
        return (0, path_1.join)(process.cwd(), 'public', 'uploads', 'mail');
    }
    normalizeFilename(filename, contentType) {
        const fallbackExt = this.extensionFromContentType(contentType);
        const rawName = (filename || 'attachment').trim();
        const ext = (0, path_1.extname)(rawName) || (fallbackExt ? `.${fallbackExt}` : '.bin');
        const base = rawName.replace(ext, '') || 'attachment';
        const safeBase = base.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 60) || 'attachment';
        const suffix = (0, crypto_1.randomBytes)(6).toString('hex');
        return `${safeBase}-${suffix}${ext}`;
    }
    extensionFromContentType(contentType) {
        if (!contentType)
            return null;
        const type = contentType.toLowerCase();
        const map = {
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
    async saveAttachments(attachments) {
        if (!Array.isArray(attachments) || attachments.length === 0)
            return [];
        const day = new Date().toISOString().slice(0, 10);
        const baseDir = this.attachmentBaseDir();
        const relativeDir = (0, path_1.join)('uploads', 'mail', day);
        const absoluteDir = (0, path_1.join)(baseDir, day);
        await (0, promises_1.mkdir)(absoluteDir, { recursive: true });
        const saved = [];
        for (const att of attachments) {
            try {
                const content = att?.content;
                if (!content)
                    continue;
                const buffer = Buffer.isBuffer(content)
                    ? content
                    : typeof content === 'string'
                        ? Buffer.from(content)
                        : content instanceof Uint8Array
                            ? Buffer.from(content)
                            : null;
                if (!buffer)
                    continue;
                const filename = this.normalizeFilename(att?.filename, att?.contentType);
                const relativePath = (0, path_1.join)(relativeDir, filename);
                const absolutePath = (0, path_1.join)(baseDir, day, filename);
                await (0, promises_1.writeFile)(absolutePath, buffer);
                saved.push({
                    filename: att?.filename || filename,
                    contentType: att?.contentType || null,
                    size: att?.size || buffer.length || null,
                    contentId: att?.contentId || null,
                    storagePath: relativePath.replace(/\\/g, '/'),
                    url: `/${relativePath.replace(/\\/g, '/')}`,
                });
            }
            catch (err) {
                this.logger.warn(`Failed to store attachment: ${err.message}`);
            }
        }
        return saved;
    }
};
exports.MailReceiverService = MailReceiverService;
exports.MailReceiverService = MailReceiverService = MailReceiverService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MailReceiverService);
