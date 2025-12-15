import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Building } from './schemas/building.schema';
import { CreateBuildingDto } from './dto/create-building.dto';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectModel(Building.name) private buildingModel: Model<Building>,
  ) {}

  async create(
    companyId: string,
    createBuildingDto: CreateBuildingDto,
  ): Promise<Building> {
    const building = new this.buildingModel({
      ...createBuildingDto,
      companyId: new Types.ObjectId(companyId),
    });
    return building.save();
  }

  async findAll(companyId: string): Promise<Building[]> {
    return this.buildingModel
      .find({ companyId: new Types.ObjectId(companyId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(companyId: string, id: string): Promise<Building> {
    const building = await this.buildingModel
      .findOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
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
    const building = await this.buildingModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          companyId: new Types.ObjectId(companyId),
        },
        { ...updateBuildingDto, updatedAt: new Date() },
        { new: true },
      )
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
}
