import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Building } from '../buildings/schemas/building.schema';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<Service>,
    @InjectModel(Building.name) private buildingModel: Model<Building>,
  ) {}

  async create(
    companyId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<Service> {
    const service = new this.serviceModel({
      ...createServiceDto,
      companyId: new Types.ObjectId(companyId),
    });
    const saved = await service.save();
    await this.syncServiceBuildings(companyId, saved._id, createServiceDto.buildingIds);
    return saved;
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

    await this.syncServiceBuildings(companyId, service._id, updateServiceDto.buildingIds);
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

    // Remove from buildings
    await this.buildingModel.updateMany(
      { companyId: new Types.ObjectId(companyId), services: new Types.ObjectId(id) },
      { $pull: { services: new Types.ObjectId(id) } },
    );
  }

  private async syncServiceBuildings(
    companyId: string,
    serviceId: Types.ObjectId,
    buildingIds?: string[],
  ): Promise<void> {
    if (!buildingIds) return;
    const ids = buildingIds.map((b) => new Types.ObjectId(b));

    const count = await this.buildingModel
      .countDocuments({
        _id: { $in: ids },
        companyId: new Types.ObjectId(companyId),
      })
      .exec();
    if (count !== ids.length) {
      throw new BadRequestException('One or more buildings are invalid for this company');
    }

    // Remove service from all company buildings
    await this.buildingModel.updateMany(
      { companyId: new Types.ObjectId(companyId), services: serviceId },
      { $pull: { services: serviceId } },
    );

    // Add service to selected buildings
    if (ids.length) {
      await this.buildingModel.updateMany(
        { companyId: new Types.ObjectId(companyId), _id: { $in: ids } },
        { $addToSet: { services: serviceId } },
      );
    }
  }
}
