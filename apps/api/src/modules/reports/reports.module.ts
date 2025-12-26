import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Invoice, InvoiceSchema } from '../invoices/schemas/invoice.schema';
import { Unit, UnitSchema } from '../units/schemas/unit.schema';
import { Contract, ContractSchema } from '../contracts/schemas/contract.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Unit.name, schema: UnitSchema },
      { name: Contract.name, schema: ContractSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
