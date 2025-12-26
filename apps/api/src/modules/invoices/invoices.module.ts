import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { InvoicesSchedulerService } from './invoices.scheduler';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { InvoiceLine, InvoiceLineSchema } from './schemas/invoice-line.schema';
import { Contract, ContractSchema } from '../contracts/schemas/contract.schema';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';
import { Meter, MeterSchema } from '../meters/schemas/meter.schema';
import { MeterReading, MeterReadingSchema } from '../meters/schemas/meter-reading.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: InvoiceLine.name, schema: InvoiceLineSchema },
      { name: Contract.name, schema: ContractSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Meter.name, schema: MeterSchema },
      { name: MeterReading.name, schema: MeterReadingSchema },
    ]),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicesSchedulerService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
