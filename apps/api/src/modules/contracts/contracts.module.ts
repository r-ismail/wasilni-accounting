import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { Contract, ContractSchema } from './schemas/contract.schema';
import { UnitsModule } from '../units/units.module';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contract.name, schema: ContractSchema },
    ]),
    UnitsModule,
    CustomersModule,
  ],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
