import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Post()
    create(@Request() req: any, @Body() createExpenseDto: CreateExpenseDto) {
        return this.expensesService.create(req.user.companyId, req.user.userId, createExpenseDto);
    }

    @Get()
    findAll(
        @Request() req: any,
        @Query('fromDate') fromDate?: string,
        @Query('toDate') toDate?: string,
        @Query('vendorId') vendorId?: string,
        @Query('buildingId') buildingId?: string,
    ) {
        return this.expensesService.findAll(req.user.companyId, {
            fromDate,
            toDate,
            vendorId,
            buildingId,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.expensesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
        return this.expensesService.update(id, updateExpenseDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.expensesService.remove(id);
    }
}
