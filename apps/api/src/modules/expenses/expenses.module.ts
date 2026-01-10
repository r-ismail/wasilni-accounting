import { Module } from '@nestjs/common';
import { TenantMongooseModule } from '../../tenant/tenant-mongoose.module';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Expense, ExpenseSchema } from './schemas/expense.schema';
import { VendorsModule } from '../vendors/vendors.module';

@Module({
    imports: [
        TenantMongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
        VendorsModule,
    ],
    controllers: [ExpensesController],
    providers: [ExpensesService],
    exports: [ExpensesService],
})
export class ExpensesModule { }
