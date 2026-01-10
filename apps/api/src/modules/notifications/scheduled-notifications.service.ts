import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Invoice, InvoiceSchema, InvoiceDocument } from '../invoices/schemas/invoice.schema';
import { Contract, ContractSchema, ContractDocument } from '../contracts/schemas/contract.schema';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './schemas/notification.schema';
import { TemplateType } from './schemas/message-template.schema';
import { CompaniesService } from '../companies/companies.service';
import { TenantConnectionService } from '../../tenant/tenant-connection.service';

@Injectable()
export class ScheduledNotificationsService {
  private readonly logger = new Logger(ScheduledNotificationsService.name);

  constructor(
    private readonly companiesService: CompaniesService,
    private readonly connectionService: TenantConnectionService,
    private readonly notificationsService: NotificationsService,
  ) { }

  private async getModels(companyId: string) {
    const dbName = await this.companiesService.getCompanyDbName(companyId);
    const connection = await this.connectionService.getConnection(dbName);

    return {
      invoiceModel: connection.models[Invoice.name] ||
        connection.model(Invoice.name, InvoiceSchema),
      contractModel: connection.models[Contract.name] ||
        connection.model(Contract.name, ContractSchema),
    };
  }

  // Run every day at 9 AM
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendPaymentReminders() {
    this.logger.log('Starting payment reminders job');

    try {
      const companies = await this.companiesService.findAll();
      for (const company of companies) {
        const companyId = company._id.toString();
        try {
          const { invoiceModel } = await this.getModels(companyId);

          // Find invoices due in 3 days
          const threeDaysFromNow = new Date();
          threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

          const upcomingInvoices = await invoiceModel
            .find({
              status: { $in: ['draft', 'posted'] },
              dueDate: {
                $gte: new Date(),
                $lte: threeDaysFromNow,
              },
            })
            .populate({
              path: 'contractId',
              populate: [{ path: 'customerId' }, { path: 'unitId' }],
            })
            .exec();

          this.logger.log(
            `Found ${upcomingInvoices.length} invoices due in 3 days for company ${companyId}`,
          );

          for (const invoice of upcomingInvoices) {
            await this.sendPaymentReminder(invoice as InvoiceDocument);
          }

          // Find overdue invoices
          const overdueInvoices = await invoiceModel
            .find({
              status: { $in: ['draft', 'posted'] },
              dueDate: { $lt: new Date() },
            })
            .populate({
              path: 'contractId',
              populate: [{ path: 'customerId' }, { path: 'unitId' }],
            })
            .exec();

          this.logger.log(`Found ${overdueInvoices.length} overdue invoices for company ${companyId}`);

          for (const invoice of overdueInvoices) {
            await this.sendOverdueNotice(invoice as InvoiceDocument);
          }
        } catch (error) {
          this.logger.error(`Error in payment reminders job for company ${companyId}`, error);
        }
      }

      this.logger.log('Payment reminders job completed');
    } catch (error) {
      this.logger.error('Error in payment reminders job', error);
    }
  }

  // Run every day at 10 AM
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendContractExpiryReminders() {
    this.logger.log('Starting contract expiry reminders job');

    try {
      const companies = await this.companiesService.findAll();
      for (const company of companies) {
        const companyId = company._id.toString();
        try {
          const { contractModel } = await this.getModels(companyId);

          // Find contracts expiring in 30 days
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

          const expiringContracts = await contractModel
            .find({
              isActive: true,
              endDate: {
                $gte: new Date(),
                $lte: thirtyDaysFromNow,
              },
            })
            .populate('customerId')
            .populate('unitId')
            .exec();

          this.logger.log(
            `Found ${expiringContracts.length} contracts expiring in 30 days for company ${companyId}`,
          );

          for (const contract of expiringContracts) {
            await this.sendContractExpiryReminder(contract as ContractDocument);
          }
        } catch (error) {
          this.logger.error(`Error in contract expiry reminders job for company ${companyId}`, error);
        }
      }

      this.logger.log('Contract expiry reminders job completed');
    } catch (error) {
      this.logger.error('Error in contract expiry reminders job', error);
    }
  }

  // Process pending scheduled notifications every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processPendingNotifications() {
    this.logger.log('Processing pending notifications');

    try {
      const companies = await this.companiesService.findAll();
      for (const company of companies) {
        await this.notificationsService.processScheduledNotifications(company._id.toString());
      }
    } catch (error) {
      this.logger.error('Error processing pending notifications', error);
    }
  }

  private async sendPaymentReminder(invoice: InvoiceDocument) {
    try {
      const contract = invoice.contractId as any;
      const customer = contract?.customerId;
      const unit = contract?.unitId;

      if (!customer?.phone) {
        this.logger.warn(
          `Customer ${customer?._id} has no phone number, skipping reminder`,
        );
        return;
      }

      // Get template
      const template = await this.notificationsService.findTemplateByType(
        invoice.companyId.toString(),
        TemplateType.PAYMENT_REMINDER,
      );

      let message = '';

      if (template) {
        message = this.notificationsService.renderTemplate(template.body, {
          customerName: customer.name,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.totalAmount,
          dueDate: invoice.dueDate.toLocaleDateString('ar-SA'),
          unitNumber: unit?.unitNumber || 'N/A',
        });
      } else {
        // Default message
        message = `عزيزي ${customer.name}، تذكير بدفع فاتورة رقم ${invoice.invoiceNumber} بمبلغ ${invoice.totalAmount} المستحقة في ${invoice.dueDate.toLocaleDateString('ar-SA')}`;
      }

      await this.notificationsService.sendNotification(
        invoice.companyId.toString(),
        'system',
        {
          type: NotificationType.SMS,
          recipient: customer.phone,
          message,
          invoiceId: invoice._id.toString(),
          customerId: customer._id.toString(),
        },
      );

      this.logger.log(
        `Payment reminder sent for invoice ${invoice.invoiceNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending payment reminder for invoice ${invoice._id}`,
        error,
      );
    }
  }

  private async sendOverdueNotice(invoice: InvoiceDocument) {
    try {
      const contract = invoice.contractId as any;
      const customer = contract?.customerId;
      const unit = contract?.unitId;

      if (!customer?.phone) {
        return;
      }

      const overdueDays = Math.floor(
        (new Date().getTime() - invoice.dueDate.getTime()) /
        (1000 * 60 * 60 * 24),
      );

      // Get template
      const template = await this.notificationsService.findTemplateByType(
        invoice.companyId.toString(),
        TemplateType.OVERDUE_NOTICE,
      );

      let message = '';

      if (template) {
        message = this.notificationsService.renderTemplate(template.body, {
          customerName: customer.name,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.totalAmount,
          overdueDays,
          unitNumber: unit?.unitNumber || 'N/A',
        });
      } else {
        // Default message
        message = `عزيزي ${customer.name}، فاتورة رقم ${invoice.invoiceNumber} بمبلغ ${invoice.totalAmount} متأخرة منذ ${overdueDays} يوم. يرجى الدفع في أقرب وقت.`;
      }

      await this.notificationsService.sendNotification(
        invoice.companyId.toString(),
        'system',
        {
          type: NotificationType.SMS,
          recipient: customer.phone,
          message,
          invoiceId: invoice._id.toString(),
          customerId: customer._id.toString(),
        },
      );

      this.logger.log(
        `Overdue notice sent for invoice ${invoice.invoiceNumber}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending overdue notice for invoice ${invoice._id}`,
        error,
      );
    }
  }

  private async sendContractExpiryReminder(contract: ContractDocument) {
    try {
      const customer = contract.customerId as any;
      const unit = contract.unitId as any;

      if (!customer?.phone) {
        return;
      }

      const daysUntilExpiry = Math.floor(
        (contract.endDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
      );

      // Get template
      const template = await this.notificationsService.findTemplateByType(
        contract.companyId.toString(),
        TemplateType.CONTRACT_EXPIRING,
      );

      let message = '';

      if (template) {
        message = this.notificationsService.renderTemplate(template.body, {
          customerName: customer.name,
          unitNumber: unit?.unitNumber || 'N/A',
          expiryDate: contract.endDate.toLocaleDateString('ar-SA'),
          daysUntilExpiry,
        });
      } else {
        // Default message
        message = `عزيزي ${customer.name}، عقد الوحدة ${unit?.unitNumber} سينتهي في ${contract.endDate.toLocaleDateString('ar-SA')} (${daysUntilExpiry} يوم). يرجى التواصل لتجديد العقد.`;
      }

      await this.notificationsService.sendNotification(
        contract.companyId.toString(),
        'system',
        {
          type: NotificationType.SMS,
          recipient: customer.phone,
          message,
          customerId: customer._id.toString(),
        },
      );

      this.logger.log(
        `Contract expiry reminder sent for contract ${contract._id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error sending contract expiry reminder for contract ${contract._id}`,
        error,
      );
    }
  }
}
