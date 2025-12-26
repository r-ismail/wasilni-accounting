import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvoicesService } from './invoices.service';
import { Contract, ContractDocument } from '../contracts/schemas/contract.schema';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';

@Injectable()
export class InvoicesSchedulerService {
  private readonly logger = new Logger(InvoicesSchedulerService.name);

  constructor(
    private readonly invoicesService: InvoicesService,
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
  ) {}

  @Cron('0 0 28 * *')
  async generateMonthlyInvoices() {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    const contracts = await this.contractModel.find({ isActive: true }).exec();

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
        await this.invoicesService.generateInvoice(
          contract.companyId.toString(),
          dto,
        );
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
