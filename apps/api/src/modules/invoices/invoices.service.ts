import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { InvoiceLine, InvoiceLineDocument } from './schemas/invoice-line.schema';
import { Contract, ContractDocument } from '../contracts/schemas/contract.schema';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import { Service, ServiceDocument } from '../services/schemas/service.schema';
import { GenerateInvoiceDto, UpdateInvoiceDto, UpdateInvoiceStatusDto } from './dto/generate-invoice.dto';
import { generateInvoicePdf, InvoicePdfData } from './pdf.helper';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(InvoiceLine.name) private invoiceLineModel: Model<InvoiceLineDocument>,
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  async generateInvoice(
    companyId: string,
    dto: GenerateInvoiceDto,
  ): Promise<InvoiceDocument> {
    const { contractId, periodStart, periodEnd, notes } = dto;

    // Validate dates
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);
    if (endDate <= startDate) {
      throw new BadRequestException('Period end must be after period start');
    }

    // Check for existing invoice for same period
    const existing = await this.invoiceModel
      .findOne({
        companyId: new Types.ObjectId(companyId),
        contractId: new Types.ObjectId(contractId),
        periodStart: startDate,
      })
      .exec();

    if (existing) {
      throw new ConflictException(
        'Invoice already exists for this contract and period',
      );
    }

    // Get contract with populated data
    const contract = await this.contractModel
      .findById(contractId)
      .populate('unitId')
      .populate('customerId')
      .exec();

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (!contract.isActive) {
      throw new BadRequestException('Cannot generate invoice for inactive contract');
    }

    // Calculate rent amount based on rent type
    let rentAmount = contract.baseRentAmount;
    if (contract.rentType === 'daily') {
      const days = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      rentAmount = contract.baseRentAmount * days;
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(companyId);

    // Create invoice
    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days

    const invoice = new this.invoiceModel({
      companyId: new Types.ObjectId(companyId),
      contractId: new Types.ObjectId(contractId),
      invoiceNumber,
      periodStart: startDate,
      periodEnd: endDate,
      issueDate,
      dueDate,
      status: 'draft',
      totalAmount: rentAmount,
      paidAmount: 0,
      notes,
    });

    await invoice.save();

    // Create rent line
    const rentLine = new this.invoiceLineModel({
      invoiceId: invoice._id,
      type: 'rent',
      description: `${contract.rentType === 'monthly' ? 'Monthly' : 'Daily'} Rent`,
      quantity: contract.rentType === 'monthly' ? 1 : Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
      unitPrice: contract.baseRentAmount,
      amount: rentAmount,
    });

    await rentLine.save();

    // Check if company wants to merge services with rent
    const company = await this.companyModel.findById(companyId).exec();
    if (company && company.mergeServicesWithRent) {
      await this.addServiceLines(invoice._id.toString(), companyId);
      // Recalculate total
      const lines = await this.invoiceLineModel
        .find({ invoiceId: invoice._id })
        .exec();
      const total = lines.reduce((sum, line) => sum + line.amount, 0);
      invoice.totalAmount = total;
      await invoice.save();
    }

    return invoice;
  }

  async findAll(
    companyId: string,
    filters?: {
      status?: string;
      contractId?: string;
      fromDate?: string;
      toDate?: string;
      overdue?: string;
    },
  ): Promise<InvoiceDocument[]> {
    const query: any = { companyId: new Types.ObjectId(companyId) };

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.contractId) {
      query.contractId = new Types.ObjectId(filters.contractId);
    }

    if (filters?.fromDate) {
      query.issueDate = { $gte: new Date(filters.fromDate) };
    }

    if (filters?.toDate) {
      query.issueDate = {
        ...query.issueDate,
        $lte: new Date(filters.toDate),
      };
    }

    // Filter for overdue invoices
    if (filters?.overdue === 'true') {
      query.status = { $in: ['draft', 'posted'] };
      query.dueDate = { $lt: new Date() };
    }

    return this.invoiceModel
      .find(query)
      .populate({
        path: 'contractId',
        populate: [
          { path: 'unitId' },
          { path: 'customerId' },
        ],
      })
      .sort({ issueDate: -1 })
      .exec();
  }

  async findOne(id: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate({
        path: 'contractId',
        populate: [
          { path: 'unitId' },
          { path: 'customerId' },
        ],
      })
      .exec();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async getInvoiceLines(invoiceId: string): Promise<InvoiceLineDocument[]> {
    return this.invoiceLineModel
      .find({ invoiceId: new Types.ObjectId(invoiceId) })
      .populate('serviceId')
      .exec();
  }

  async updateStatus(
    id: string,
    dto: UpdateInvoiceStatusDto,
  ): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel.findById(id).exec();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === 'paid') {
      throw new BadRequestException('Cannot modify paid invoice');
    }

    invoice.status = dto.status;
    await invoice.save();

    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel.findById(id).exec();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === 'paid') {
      throw new BadRequestException('Cannot modify paid invoice');
    }

    if (dto.periodStart) invoice.periodStart = new Date(dto.periodStart);
    if (dto.periodEnd) invoice.periodEnd = new Date(dto.periodEnd);
    if (dto.dueDate) invoice.dueDate = new Date(dto.dueDate);
    if (dto.notes !== undefined) invoice.notes = dto.notes;

    await invoice.save();
    return invoice;
  }

  async delete(id: string): Promise<void> {
    const invoice = await this.invoiceModel.findById(id).exec();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === 'paid') {
      throw new BadRequestException('Cannot delete paid invoice');
    }

    // Delete invoice lines
    await this.invoiceLineModel.deleteMany({ invoiceId: invoice._id }).exec();

    // Delete invoice
    await this.invoiceModel.findByIdAndDelete(id).exec();
  }

  private async addServiceLines(
    invoiceId: string,
    companyId: string,
  ): Promise<void> {
    // Get active fixed-fee services for the company
    const services = await this.serviceModel
      .find({
        companyId: new Types.ObjectId(companyId),
        isActive: true,
        serviceType: 'fixed_fee',
      })
      .exec();

    // Create invoice lines for each service
    for (const service of services) {
      const serviceLine = new this.invoiceLineModel({
        invoiceId: new Types.ObjectId(invoiceId),
        type: 'service',
        description: service.name,
        quantity: 1,
        unitPrice: service.defaultPrice,
        amount: service.defaultPrice,
        serviceId: service._id,
      });
      await serviceLine.save();
    }
  }

  private async generateInvoiceNumber(companyId: string): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `INV-${year}${month}`;

    // Find the last invoice for this month
    const lastInvoice = await this.invoiceModel
      .findOne({
        companyId: new Types.ObjectId(companyId),
        invoiceNumber: { $regex: `^${prefix}` },
      })
      .sort({ invoiceNumber: -1 })
      .exec();

    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }

  async generatePdf(id: string): Promise<Buffer> {
    const invoice = await this.invoiceModel
      .findById(id)
      .populate({
        path: 'contractId',
        populate: [
          { path: 'unitId', populate: 'buildingId' },
          { path: 'customerId' },
        ],
      })
      .exec();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const lines = await this.invoiceLineModel
      .find({ invoiceId: invoice._id })
      .exec();

    const company = await this.companyModel
      .findById(invoice.companyId)
      .exec();

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const contract: any = invoice.contractId;
    const customer: any = contract.customerId;
    const unit: any = contract.unitId;
    const building: any = unit?.buildingId;

    const pdfData: InvoicePdfData = {
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        status: invoice.status,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        periodStart: invoice.periodStart,
        periodEnd: invoice.periodEnd,
      },
      company: {
        name: company.name,
        currency: company.currency,
        defaultLanguage: company.defaultLanguage,
      },
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
      },
      unit: {
        unitNumber: unit.unitNumber,
        buildingName: building?.name,
      },
      lines: lines.map((line) => ({
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        amount: line.amount,
      })),
    };

    return generateInvoicePdf(pdfData);
  }
}
