import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { InvoiceLine, InvoiceLineSchema } from './schemas/invoice-line.schema';
import { Contract, ContractSchema } from '../contracts/schemas/contract.schema';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: InvoiceLine.name, schema: InvoiceLineSchema },
      { name: Contract.name, schema: ContractSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
