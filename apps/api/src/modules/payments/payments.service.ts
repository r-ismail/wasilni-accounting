import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from './schemas/payment.schema';
import { Invoice, InvoiceDocument } from '../invoices/schemas/invoice.schema';
import { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) { }

  async create(
    createPaymentDto: CreatePaymentDto,
    companyId: string,
    userId: string,
  ): Promise<PaymentDocument> {
    // Get invoice
    // Convert string to ObjectId if needed
    const invoiceId = typeof createPaymentDto.invoiceId === 'string'
      ? new (Types.ObjectId as any)(createPaymentDto.invoiceId)
      : createPaymentDto.invoiceId;

    // Convert companyId to ObjectId if needed
    const companyObjectId = typeof companyId === 'string'
      ? new (Types.ObjectId as any)(companyId)
      : companyId;

    const invoice = await this.invoiceModel
      .findOne({ _id: invoiceId, companyId: companyObjectId })
      .populate({
        path: 'contractId',
        populate: {
          path: 'customerId',
        },
      });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Validate payment amount
    const remainingAmount = invoice.totalAmount - invoice.paidAmount;
    if (createPaymentDto.amount > remainingAmount) {
      throw new BadRequestException(
        `Payment amount (${createPaymentDto.amount}) exceeds remaining balance (${remainingAmount})`,
      );
    }

    // Create payment
    // Convert userId to ObjectId if needed
    const userObjectId = typeof userId === 'string'
      ? new (Types.ObjectId as any)(userId)
      : userId;

    const payment = new this.paymentModel({
      ...createPaymentDto,
      companyId: companyObjectId,
      contractId: (invoice.contractId as any)._id,
      customerId: (invoice.contractId as any).customerId,
      paymentMethod: 'cash',
      recordedBy: userObjectId,
    });

    await payment.save();

    // Update invoice paid amount
    invoice.paidAmount += createPaymentDto.amount;

    // Update invoice status
    if (invoice.paidAmount >= invoice.totalAmount) {
      invoice.status = 'paid';
    } else if (invoice.status === 'draft') {
      invoice.status = 'posted';
    }

    await invoice.save();

    return payment;
  }

  async findAll(companyId: string, filters?: any): Promise<PaymentDocument[]> {
    // Convert companyId to ObjectId if needed
    const companyObjectId = typeof companyId === 'string'
      ? new (Types.ObjectId as any)(companyId)
      : companyId;

    const query: any = { companyId: companyObjectId };

    if (filters?.invoiceId) {
      query.invoiceId = filters.invoiceId;
    }

    if (filters?.contractId) {
      query.contractId = filters.contractId;
    }

    if (filters?.customerId) {
      query.customerId = filters.customerId;
    }

    return this.paymentModel
      .find(query)
      .populate('invoiceId')
      .populate('contractId')
      .populate('customerId')
      .populate('recordedBy', 'username')
      .sort({ paymentDate: -1 })
      .exec();
  }

  async findOne(id: string, companyId: string): Promise<PaymentDocument> {
    // Convert companyId to ObjectId if needed
    const companyObjectId = typeof companyId === 'string'
      ? new (Types.ObjectId as any)(companyId)
      : companyId;

    const payment = await this.paymentModel
      .findOne({ _id: id, companyId: companyObjectId })
      .populate('invoiceId')
      .populate('contractId')
      .populate('customerId')
      .populate('recordedBy', 'username');

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async delete(id: string, companyId: string): Promise<void> {
    const companyObjectId = typeof companyId === 'string'
      ? new (Types.ObjectId as any)(companyId)
      : companyId;
    const payment = await this.paymentModel.findOne({ _id: id, companyId: companyObjectId });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Update invoice paid amount
    const invoice = await this.invoiceModel.findById(payment.invoiceId);
    if (invoice) {
      invoice.paidAmount -= payment.amount;
      if (invoice.paidAmount < 0) {
        invoice.paidAmount = 0;
      }

      // Update invoice status
      if (invoice.paidAmount === 0) {
        invoice.status = 'draft';
      } else if (invoice.paidAmount < invoice.totalAmount) {
        invoice.status = 'posted';
      } else if (invoice.paidAmount >= invoice.totalAmount) {
        invoice.status = 'paid';
      }

      await invoice.save();
    }

    await payment.deleteOne();
  }

  async getPaymentsByInvoice(
    invoiceId: string,
    companyId: string,
  ): Promise<PaymentDocument[]> {
    const companyObjectId = typeof companyId === 'string'
      ? new (Types.ObjectId as any)(companyId)
      : companyId;
    return this.paymentModel
      .find({ invoiceId, companyId: companyObjectId })
      .populate('recordedBy', 'username')
      .sort({ paymentDate: -1 })
      .exec();
  }

  async getPaymentsByContract(
    contractId: string,
    companyId: string,
  ): Promise<PaymentDocument[]> {
    const companyObjectId = typeof companyId === 'string'
      ? new (Types.ObjectId as any)(companyId)
      : companyId;
    return this.paymentModel
      .find({ contractId, companyId: companyObjectId })
      .populate('invoiceId')
      .populate('recordedBy', 'username')
      .sort({ paymentDate: -1 })
      .exec();
  }
}
