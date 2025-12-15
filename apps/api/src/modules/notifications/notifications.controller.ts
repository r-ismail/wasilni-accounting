import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import {
  SendNotificationDto,
  CreateTemplateDto,
  UpdateTemplateDto,
  SendBulkNotificationDto,
} from './dto/notification.dto';
import { NotificationType, NotificationStatus } from './schemas/notification.schema';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ==================== Notifications ====================

  @Post()
  @ApiOperation({ summary: 'Send a notification' })
  async sendNotification(
    @Request() req: any,
    @Body() sendNotificationDto: SendNotificationDto,
  ) {
    const notification = await this.notificationsService.sendNotification(
      req.user.companyId,
      req.user.userId,
      sendNotificationDto,
    );

    return {
      success: true,
      data: notification,
      message: 'Notification sent successfully',
    };
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Send bulk notifications' })
  async sendBulkNotification(
    @Request() req: any,
    @Body() sendBulkNotificationDto: SendBulkNotificationDto,
  ) {
    const notifications = await this.notificationsService.sendBulkNotification(
      req.user.companyId,
      req.user.userId,
      sendBulkNotificationDto,
    );

    return {
      success: true,
      data: notifications,
      message: `${notifications.length} notifications sent successfully`,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  async findAll(
    @Request() req: any,
    @Query('status') status?: NotificationStatus,
    @Query('type') type?: NotificationType,
    @Query('customerId') customerId?: string,
  ) {
    const notifications = await this.notificationsService.findAllNotifications(
      req.user.companyId,
      { status, type, customerId },
    );

    return {
      success: true,
      data: notifications,
    };
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry a failed notification' })
  async retryNotification(@Param('id') id: string) {
    const notification =
      await this.notificationsService.retryFailedNotification(id);

    return {
      success: true,
      data: notification,
      message: 'Notification retried successfully',
    };
  }

  // ==================== Templates ====================

  @Post('templates')
  @ApiOperation({ summary: 'Create a message template' })
  async createTemplate(
    @Request() req: any,
    @Body() createTemplateDto: CreateTemplateDto,
  ) {
    const template = await this.notificationsService.createTemplate(
      req.user.companyId,
      createTemplateDto,
    );

    return {
      success: true,
      data: template,
      message: 'Template created successfully',
    };
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all templates' })
  async findAllTemplates(@Request() req: any) {
    const templates = await this.notificationsService.findAllTemplates(
      req.user.companyId,
    );

    return {
      success: true,
      data: templates,
    };
  }

  @Get('templates/:type')
  @ApiOperation({ summary: 'Get template by type' })
  async findTemplateByType(@Request() req: any, @Param('type') type: string) {
    const template = await this.notificationsService.findTemplateByType(
      req.user.companyId,
      type as any,
    );

    return {
      success: true,
      data: template,
    };
  }

  @Put('templates/:id')
  @ApiOperation({ summary: 'Update a template' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
  ) {
    const template = await this.notificationsService.updateTemplate(
      id,
      updateTemplateDto,
    );

    return {
      success: true,
      data: template,
      message: 'Template updated successfully',
    };
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete a template' })
  async deleteTemplate(@Param('id') id: string) {
    await this.notificationsService.deleteTemplate(id);

    return {
      success: true,
      message: 'Template deleted successfully',
    };
  }
}
