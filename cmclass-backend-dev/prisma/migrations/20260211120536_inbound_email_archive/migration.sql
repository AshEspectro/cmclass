-- CreateTable
CREATE TABLE "InboundEmail" (
    "id" SERIAL NOT NULL,
    "messageId" TEXT,
    "sourceId" TEXT,
    "protocol" TEXT NOT NULL DEFAULT 'imap',
    "mailbox" TEXT NOT NULL DEFAULT 'INBOX',
    "fromName" TEXT,
    "fromEmail" TEXT,
    "toEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ccEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "subject" TEXT,
    "text" TEXT,
    "html" TEXT,
    "receivedAt" TIMESTAMP(3),
    "attachments" JSONB,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboundEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InboundEmail_messageId_key" ON "InboundEmail"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "InboundEmail_protocol_sourceId_mailbox_key" ON "InboundEmail"("protocol", "sourceId", "mailbox");
