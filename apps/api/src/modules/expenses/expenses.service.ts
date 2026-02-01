import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Expense, ExpenseDocument } from './schemas/expense.schema';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectModel(Expense.name) private expenseModel: Model<ExpenseDocument>,
    ) { }

    async create(companyId: string, userId: string, dto: CreateExpenseDto): Promise<ExpenseDocument> {
        const expense = new this.expenseModel({
            ...dto,
            companyId: new (Types.ObjectId as any)(companyId),
            recordedBy: new (Types.ObjectId as any)(userId),
        });
        return expense.save();
    }

    async findAll(
        companyId: string,
        filters?: { fromDate?: string; toDate?: string; vendorId?: string; buildingId?: string }
    ): Promise<ExpenseDocument[]> {
        const query: any = { companyId: new (Types.ObjectId as any)(companyId) };

        if (filters?.fromDate || filters?.toDate) {
            query.date = {};
            if (filters.fromDate) query.date.$gte = new Date(filters.fromDate);
            if (filters.toDate) query.date.$lte = new Date(filters.toDate);
        }

        if (filters?.vendorId) {
            query.vendorId = new (Types.ObjectId as any)(filters.vendorId);
        }

        if (filters?.buildingId) {
            query.buildingId = new (Types.ObjectId as any)(filters.buildingId);
        }

        return this.expenseModel
            .find(query)
            .populate('vendorId', 'name')
            .populate('buildingId', 'name')
            .populate('unitId', 'unitNumber')
            .populate('recordedBy', 'username')
            .sort({ date: -1 })
            .exec();
    }

    async findOne(id: string): Promise<ExpenseDocument> {
        const expense = await this.expenseModel
            .findById(id)
            .populate('vendorId')
            .populate('buildingId')
            .populate('unitId')
            .exec();

        if (!expense) {
            throw new NotFoundException('Expense not found');
        }
        return expense;
    }

    async update(id: string, dto: UpdateExpenseDto): Promise<ExpenseDocument> {
        const expense = await this.expenseModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true })
            .exec();

        if (!expense) {
            throw new NotFoundException('Expense not found');
        }
        return expense;
    }

    async remove(id: string): Promise<void> {
        const result = await this.expenseModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException('Expense not found');
        }
    }
}
