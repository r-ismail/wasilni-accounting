import { IsString, IsEnum, IsOptional, IsDateString, IsMongoId } from 'class-validator';
import { NotificationType } from '../schemas/notification.schema';

export class SendNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  recipient: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @IsOptional()
  @IsMongoId()
  invoiceId?: string;

  @IsOptional()
  @IsMongoId()
  customerId?: string;
}

export class CreateTemplateDto {
  @IsEnum(['payment_reminder', 'payment_received', 'invoice_generated', 'contract_expiring', 'overdue_notice'])
  type: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString({ each: true })
  variables?: string[];

  @IsOptional()
  @IsEnum(NotificationType, { each: true })
  channels?: NotificationType[];
}

export class UpdateTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString({ each: true })
  variables?: string[];

  @IsOptional()
  @IsEnum(NotificationType, { each: true })
  channels?: NotificationType[];

  @IsOptional()
  isActive?: boolean;
}

export class SendBulkNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString({ each: true })
  recipients: string[];

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;
}
