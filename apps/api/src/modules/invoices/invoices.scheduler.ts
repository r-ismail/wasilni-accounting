import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { getModelToken } from '@nestjs/mongoose';
import { ContextIdFactory, ModuleRef } from '@nestjs/core';
import { Model } from 'mongoose';
import { InvoicesService } from './invoices.service';
import { Contract, ContractDocument } from '../contracts/schemas/contract.schema';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class InvoicesSchedulerService {
  private readonly logger = new Logger(InvoicesSchedulerService.name);

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly companiesService: CompaniesService,
  ) {}

  @Cron('0 0 28 * *')
  async generateMonthlyInvoices() {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    const companies = await this.companiesService.findAll();

    for (const company of companies) {
      const companyId = company._id.toString();
      const contextId = ContextIdFactory.create();
      this.moduleRef.registerRequestByContextId(
        { user: { companyId } },
        contextId,
      );

      const contractModel = await this.moduleRef.resolve<Model<ContractDocument>>(
        getModelToken(Contract.name),
        contextId,
        { strict: false },
      );
      const invoicesService = await this.moduleRef.resolve(
        InvoicesService,
        contextId,
        { strict: false },
      );

      const contracts = await contractModel.find({ isActive: true }).exec();

      for (const contract of contracts) {
        const contractStart = contract.startDate;
        const contractEnd = contract.endDate;

        if (contractEnd < periodStart || contractStart > periodEnd) {
          continue;
        }

        const effectiveStart = contractStart > periodStart ? contractStart : periodStart;
        const effectiveEnd = contractEnd < periodEnd ? contractEnd : periodEnd;

        const dto: GenerateInvoiceDto = {
          contractId: contract._id.toString(),
          periodStart: effectiveStart.toISOString(),
          periodEnd: effectiveEnd.toISOString(),
          notes: 'Auto-generated on day 28',
        };

        try {
          await invoicesService.generateInvoice(companyId, dto);
        } catch (error) {
          if (error instanceof ConflictException) {
            continue;
          }
          this.logger.warn(
            `Failed to auto-generate invoice for contract ${contract._id}: ${error?.message || error}`,
          );
        }
      }
    }
  }
}
