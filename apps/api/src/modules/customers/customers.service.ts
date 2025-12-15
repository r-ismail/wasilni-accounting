import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async create(companyId: string, createCustomerDto: CreateCustomerDto): Promise<CustomerDocument> {
    // Check if phone already exists for this company
    const existing = await this.customerModel.findOne({
      companyId: new Types.ObjectId(companyId),
      phone: createCustomerDto.phone,
    });

    if (existing) {
      throw new BadRequestException('Customer with this phone number already exists');
    }

    const customer = new this.customerModel({
      ...createCustomerDto,
      companyId: new Types.ObjectId(companyId),
    });

    return customer.save();
  }

  async findAll(
    companyId: string,
    filters?: { search?: string; type?: string; activeOnly?: boolean },
  ): Promise<CustomerDocument[]> {
    const query: any = { companyId: new Types.ObjectId(companyId) };

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
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    }).exec();

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(
    companyId: string,
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerDocument> {
    // If phone is being updated, check uniqueness
    if (updateCustomerDto.phone) {
      const existing = await this.customerModel.findOne({
        companyId: new Types.ObjectId(companyId),
        phone: updateCustomerDto.phone,
        _id: { $ne: new Types.ObjectId(id) },
      });

      if (existing) {
        throw new BadRequestException('Customer with this phone number already exists');
      }
    }

    const customer = await this.customerModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
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
      _id: new Types.ObjectId(id),
      companyId: new Types.ObjectId(companyId),
    }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Customer not found');
    }
  }
}
