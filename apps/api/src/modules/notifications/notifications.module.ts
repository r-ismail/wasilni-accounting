import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import {
  MessageTemplate,
  MessageTemplateSchema,
} from './schemas/message-template.schema';
import { ScheduledNotificationsService } from './scheduled-notifications.service';
import { Invoice, InvoiceSchema } from '../invoices/schemas/invoice.schema';
import { Contract, ContractSchema } from '../contracts/schemas/contract.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: MessageTemplate.name, schema: MessageTemplateSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Contract.name, schema: ContractSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, ScheduledNotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
