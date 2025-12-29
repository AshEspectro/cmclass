import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { MailService } from '../mail/mail.service';
import { AuditController } from './audit.controller';

@Module({
  imports: [AuthModule],
  controllers: [AdminController, UsersController, AuditController],
  providers: [MailService],
})
export class AdminModule {}
