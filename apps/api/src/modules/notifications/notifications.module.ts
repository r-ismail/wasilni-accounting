import { Module } from '@nestjs/common';
import { CompaniesModule } from '../companies/companies.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ScheduledNotificationsService } from './scheduled-notifications.service';

@Module({
  imports: [CompaniesModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, ScheduledNotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule { }
