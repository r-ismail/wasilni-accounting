import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>,
  ) {}

  async create(
    companyId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    const service = new this.serviceModel({
      ...createServiceDto,
      companyId: new Types.ObjectId(companyId),
    });
    return service.save();
  }

  async findAll(companyId: string, activeOnly = false): Promise<Service[]> {
    const query: any = { companyId: new Types.ObjectId(companyId) };
    if (activeOnly) {
      query.isActive = true;
    }
    return this.serviceModel.find(query).sort({ name: 1 }).exec();
  }

  async findOne(companyId: string, id: string): Promise<Service> {
    const service = await this.serviceModel
      .findOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async update(
    companyId: string,
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    const service = await this.serviceModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          companyId: new Types.ObjectId(companyId),
        },
        { ...updateServiceDto, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }

  async remove(companyId: string, id: string): Promise<void> {
    const result = await this.serviceModel
      .deleteOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
  }
}
