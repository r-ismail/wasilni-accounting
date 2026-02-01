import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';
import { Contract, ContractDocument } from '../contracts/schemas/contract.schema';
import { Invoice, InvoiceDocument } from '../invoices/schemas/invoice.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) { }

  async create(companyId: string, createCustomerDto: CreateCustomerDto): Promise<CustomerDocument> {
    // Check if phone already exists for this company
    const existing = await this.customerModel.findOne({
      companyId: new (Types.ObjectId as any)(companyId),
      phone: createCustomerDto.phone,
    });

    if (existing) {
      throw new BadRequestException('Customer with this phone number already exists');
    }

    const customer = new this.customerModel({
      ...createCustomerDto,
      companyId: new (Types.ObjectId as any)(companyId),
    });

    return customer.save();
  }

  async findAll(
    companyId: string,
    filters?: { search?: string; type?: string; activeOnly?: boolean },
  ): Promise<CustomerDocument[]> {
    const query: any = { companyId: new (Types.ObjectId as any)(companyId) };

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.activeOnly) {
      query.isActive = true;
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { phone: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return this.customerModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOne(companyId: string, id: string): Promise<CustomerDocument> {
    const customer = await this.customerModel.findOne({
      _id: new (Types.ObjectId as any)(id),
      companyId: new (Types.ObjectId as any)(companyId),
    }).exec();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async getProfile(companyId: string, id: string): Promise<any> {
    const customer = await this.findOne(companyId, id);
    const companyObjectId = new (Types.ObjectId as any)(companyId);
    const customerObjectId = new (Types.ObjectId as any)(id);

    const contracts = await this.contractModel
      .find({
        companyId: companyObjectId,
        customerId: customerObjectId,
      })
      .populate({
        path: 'unitId',
        select: 'unitNumber buildingId',
        populate: { path: 'buildingId', select: 'name' },
      })
      .sort({ startDate: -1 })
      .exec();

    const contractIds = contracts.map((contract) => contract._id);
    const invoices = contractIds.length
      ? await this.invoiceModel
        .find({
          companyId: companyObjectId,
          contractId: { $in: contractIds },
        })
        .populate({
          path: 'contractId',
          select: 'unitId startDate endDate',
          populate: {
            path: 'unitId',
            select: 'unitNumber buildingId',
            populate: { path: 'buildingId', select: 'name' },
          },
        })
        .sort({ issueDate: -1 })
        .exec()
      : [];

    const payments = await this.paymentModel
      .find({
        companyId: companyObjectId,
        customerId: customerObjectId,
      })
      .populate('invoiceId', 'invoiceNumber totalAmount')
      .sort({ paymentDate: -1 })
      .exec();

    const totalInvoiced = invoices.reduce(
      (sum, invoice) => sum + (invoice.totalAmount || 0),
      0,
    );
    const now = new Date();
    const overdueInvoices = invoices.filter(
      (invoice) =>
        !['paid', 'cancelled'].includes(invoice.status) &&
        invoice.dueDate &&
        new Date(invoice.dueDate) < now,
    );
    const overdueAmount = overdueInvoices.reduce(
      (sum, invoice) => sum + (invoice.totalAmount || 0) - (invoice.paidAmount || 0),
      0,
    );
    const totalPaid = payments.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0,
    );
    const outstanding = totalInvoiced - totalPaid;
    const openInvoices = invoices.filter(
      (invoice) => !['paid', 'cancelled'].includes(invoice.status),
    ).length;
    const activeContracts = contracts.filter((contract) => contract.isActive).length;
    const lastPayment = payments.length
      ? {
        amount: payments[0].amount,
        paymentDate: payments[0].paymentDate,
        paymentMethod: payments[0].paymentMethod,
        invoiceId: payments[0].invoiceId,
      }
      : null;

    return {
      customer,
      summary: {
        totalInvoiced,
        totalPaid,
        outstanding,
        openInvoices,
        overdueInvoices: overdueInvoices.length,
        overdueAmount,
        activeContracts,
        lastPayment,
      },
      contracts,
      invoices,
      payments,
    };
  }

  async update(
    companyId: string,
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerDocument> {
    // If phone is being updated, check uniqueness
    if (updateCustomerDto.phone) {
      const existing = await this.customerModel.findOne({
        companyId: new (Types.ObjectId as any)(companyId),
        phone: updateCustomerDto.phone,
        _id: { $ne: new (Types.ObjectId as any)(id) },
      });

      if (existing) {
        throw new BadRequestException('Customer with this phone number already exists');
      }
    }

    const customer = await this.customerModel.findOneAndUpdate(
      {
        _id: new (Types.ObjectId as any)(id),
        companyId: new (Types.ObjectId as any)(companyId),
      },
      { $set: updateCustomerDto },
      { new: true },
    ).exec();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async remove(companyId: string, id: string): Promise<void> {
    const result = await this.customerModel.deleteOne({
      _id: new (Types.ObjectId as any)(id),
      companyId: new (Types.ObjectId as any)(companyId),
    }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Customer not found');
    }
  }
}
