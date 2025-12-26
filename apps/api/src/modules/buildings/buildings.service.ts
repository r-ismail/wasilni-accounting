import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Building } from './schemas/building.schema';
import { CreateBuildingDto } from './dto/create-building.dto';
import { Service, ServiceDocument } from '../services/schemas/service.schema';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectModel(Building.name) private buildingModel: Model<Building>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  async create(
    companyId: string,
    createBuildingDto: CreateBuildingDto,
  ): Promise<Building> {
    const services = await this.validateServices(companyId, createBuildingDto.services);

    const building = new this.buildingModel({
      ...createBuildingDto,
      companyId: new Types.ObjectId(companyId),
      services,
    });
    return building.save();
  }

  async findAll(companyId: string): Promise<Building[]> {
    return this.buildingModel
      .find({ companyId: new Types.ObjectId(companyId) })
      .populate('services', 'name type')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(companyId: string, id: string): Promise<Building> {
    const building = await this.buildingModel
      .findOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .populate('services', 'name type')
      .exec();

    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }

    return building;
  }

  async update(
    companyId: string,
    id: string,
    updateBuildingDto: Partial<CreateBuildingDto>,
  ): Promise<Building> {
    const services =
      updateBuildingDto.services !== undefined
        ? await this.validateServices(companyId, updateBuildingDto.services)
        : undefined;

    const building = await this.buildingModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          companyId: new Types.ObjectId(companyId),
        },
        { ...updateBuildingDto, ...(services ? { services } : {}), updatedAt: new Date() },
        { new: true },
      )
      .populate('services', 'name type')
      .exec();

    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }

    return building;
  }

  async remove(companyId: string, id: string): Promise<void> {
    const result = await this.buildingModel
      .deleteOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Building with ID ${id} not found`);
    }
  }

  private async validateServices(
    companyId: string,
    serviceIds?: string[] | Types.ObjectId[],
  ): Promise<Types.ObjectId[] | undefined> {
    if (!serviceIds) return undefined;
    const ids = serviceIds.map((id) => new Types.ObjectId(id));
    const count = await this.serviceModel
      .countDocuments({
        _id: { $in: ids },
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (count !== ids.length) {
      throw new BadRequestException('One or more services are invalid for this company');
    }

    return ids;
  }
}
