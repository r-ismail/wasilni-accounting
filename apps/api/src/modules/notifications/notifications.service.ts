import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
  NotificationStatus,
} from './schemas/notification.schema';
import {
  MessageTemplate,
  MessageTemplateDocument,
  TemplateType,
} from './schemas/message-template.schema';
import {
  SendNotificationDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  SendBulkNotificationDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(MessageTemplate.name)
    private templateModel: Model<MessageTemplateDocument>,
  ) {}

  // ==================== Notifications ====================

  async sendNotification(
    companyId: string,
    userId: string,
    dto: SendNotificationDto,
  ): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      companyId: new Types.ObjectId(companyId),
      type: dto.type,
      recipient: dto.recipient,
      message: dto.message,
      scheduledAt: dto.scheduledAt || new Date(),
      invoiceId: dto.invoiceId
        ? new Types.ObjectId(dto.invoiceId)
        : undefined,
      customerId: dto.customerId
        ? new Types.ObjectId(dto.customerId)
        : undefined,
      createdBy: new Types.ObjectId(userId),
      status: dto.scheduledAt
        ? NotificationStatus.PENDING
        : NotificationStatus.PENDING,
    });

    await notification.save();

    // If not scheduled, send immediately
    if (!dto.scheduledAt) {
      await this.processNotification(notification);
    }

    return notification;
  }

  async sendBulkNotification(
    companyId: string,
    userId: string,
    dto: SendBulkNotificationDto,
  ): Promise<NotificationDocument[]> {
    const notifications = await Promise.all(
      dto.recipients.map((recipient) =>
        this.sendNotification(companyId, userId, {
          type: dto.type,
          recipient,
          message: dto.message,
          scheduledAt: dto.scheduledAt,
        }),
      ),
    );

    return notifications;
  }

  async processNotification(
    notification: NotificationDocument,
  ): Promise<void> {
    try {
      this.logger.log(
        `Processing ${notification.type} notification to ${notification.recipient}`,
      );

      // Simulate sending (in production, integrate with real services)
      switch (notification.type) {
        case NotificationType.SMS:
          await this.sendSMS(notification.recipient, notification.message);
          break;
        case NotificationType.WHATSAPP:
          await this.sendWhatsApp(notification.recipient, notification.message);
          break;
        case NotificationType.EMAIL:
          await this.sendEmail(notification.recipient, notification.message);
          break;
      }

      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
      await notification.save();

      this.logger.log(
        `Successfully sent ${notification.type} notification to ${notification.recipient}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send ${notification.type} notification to ${notification.recipient}`,
        error,
      );
      notification.status = NotificationStatus.FAILED;
      notification.error = error.message;
      await notification.save();
    }
  }

  private async sendSMS(phone: string, message: string): Promise<void> {
    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    this.logger.log(`[SMS] To: ${phone}, Message: ${message}`);
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  private async sendWhatsApp(phone: string, message: string): Promise<void> {
    // TODO: Integrate with WhatsApp Business API
    this.logger.log(`[WhatsApp] To: ${phone}, Message: ${message}`);
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  private async sendEmail(email: string, message: string): Promise<void> {
    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    this.logger.log(`[Email] To: ${email}, Message: ${message}`);
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  async findAllNotifications(
    companyId: string,
    filters?: {
      status?: NotificationStatus;
      type?: NotificationType;
      customerId?: string;
    },
  ): Promise<NotificationDocument[]> {
    const query: any = { companyId: new Types.ObjectId(companyId) };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.customerId) {
      query.customerId = new Types.ObjectId(filters.customerId);
    }

    return this.notificationModel
      .find(query)
      .populate('customerId')
      .populate('invoiceId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPendingNotifications(): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({
        status: NotificationStatus.PENDING,
        scheduledAt: { $lte: new Date() },
      })
      .exec();
  }

  async retryFailedNotification(id: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findById(id).exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.status !== NotificationStatus.FAILED) {
      throw new Error('Only failed notifications can be retried');
    }

    notification.status = NotificationStatus.PENDING;
    notification.error = undefined;
    await notification.save();

    await this.processNotification(notification);

    return notification;
  }

  // ==================== Templates ====================

  async createTemplate(
    companyId: string,
    dto: CreateTemplateDto,
  ): Promise<MessageTemplateDocument> {
    const template = new this.templateModel({
      companyId: new Types.ObjectId(companyId),
      ...dto,
    });

    return template.save();
  }

  async findAllTemplates(
    companyId: string,
  ): Promise<MessageTemplateDocument[]> {
    return this.templateModel
      .find({
        $or: [
          { companyId: new Types.ObjectId(companyId) },
          { isDefault: true },
        ],
      })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();
  }

  async findTemplateByType(
    companyId: string,
    type: TemplateType,
  ): Promise<MessageTemplateDocument | null> {
    // Try to find company-specific template first
    let template = await this.templateModel
      .findOne({
        companyId: new Types.ObjectId(companyId),
        type,
        isActive: true,
      })
      .exec();

    // If not found, try default template
    if (!template) {
      template = await this.templateModel
        .findOne({
          type,
          isDefault: true,
          isActive: true,
        })
        .exec();
    }

    return template;
  }

  async updateTemplate(
    id: string,
    dto: UpdateTemplateDto,
  ): Promise<MessageTemplateDocument> {
    const template = await this.templateModel.findById(id).exec();

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.isDefault) {
      throw new Error('Cannot modify default templates');
    }

    Object.assign(template, dto);
    return template.save();
  }

  async deleteTemplate(id: string): Promise<void> {
    const template = await this.templateModel.findById(id).exec();

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.isDefault) {
      throw new Error('Cannot delete default templates');
    }

    await this.templateModel.findByIdAndDelete(id).exec();
  }

  // ==================== Template Rendering ====================

  renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    }

    return rendered;
  }

  // ==================== Scheduled Notifications ====================

  async processScheduledNotifications(): Promise<void> {
    const pending = await this.findPendingNotifications();

    this.logger.log(
      `Processing ${pending.length} scheduled notifications`,
    );

    for (const notification of pending) {
      await this.processNotification(notification);
    }
  }
}
