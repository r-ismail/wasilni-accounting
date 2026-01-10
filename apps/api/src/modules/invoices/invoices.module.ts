import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantMongooseModule } from '../../tenant/tenant-mongoose.module';
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
import { Building, BuildingSchema } from '../buildings/schemas/building.schema';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [
    TenantMongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: InvoiceLine.name, schema: InvoiceLineSchema },
      { name: Contract.name, schema: ContractSchema },
      { name: Service.name, schema: ServiceSchema },
      { name: Meter.name, schema: MeterSchema },
      { name: MeterReading.name, schema: MeterReadingSchema },
      { name: Building.name, schema: BuildingSchema },
    ]),
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    CompaniesModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicesSchedulerService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
