import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Unit, UsageType } from './schemas/unit.schema';
import { CreateUnitDto } from './dto/create-unit.dto';
import { BulkCreateUnitsDto } from './dto/bulk-create-units.dto';

@Injectable()
export class UnitsService {
  constructor(@InjectModel(Unit.name) private unitModel: Model<Unit>) {}

  async create(companyId: string, createUnitDto: CreateUnitDto): Promise<Unit> {
    const unit = new this.unitModel({
      ...createUnitDto,
      companyId: new Types.ObjectId(companyId),
      buildingId: new Types.ObjectId(createUnitDto.buildingId),
      usageType: createUnitDto.usageType || UsageType.APARTMENT,
    });
    return unit.save();
  }

  async bulkCreate(
    companyId: string,
    bulkCreateDto: BulkCreateUnitsDto,
  ): Promise<any[]> {
    const units: any[] = [];

    for (let i = 0; i < bulkCreateDto.count; i++) {
      const unitNumber = (bulkCreateDto.startNumber + i).toString();
      units.push({
        companyId: new Types.ObjectId(companyId),
        buildingId: new Types.ObjectId(bulkCreateDto.buildingId),
        unitNumber,
        furnishingStatus: bulkCreateDto.furnishingStatus,
        usageType: bulkCreateDto.usageType || UsageType.APARTMENT,
        defaultRentMonthly: bulkCreateDto.defaultRentMonthly,
        defaultRentDaily: bulkCreateDto.defaultRentDaily,
      });
    }

    return this.unitModel.insertMany(units);
  }

  async findAll(
    companyId: string,
    filters?: {
      buildingId?: string;
      status?: string;
      furnishingStatus?: string;
    },
  ): Promise<Unit[]> {
    const query: any = { companyId: new Types.ObjectId(companyId) };

    if (filters?.buildingId) {
      query.buildingId = new Types.ObjectId(filters.buildingId);
    }
    if (filters?.status) {
      query.status = filters.status;
    }
    if (filters?.furnishingStatus) {
      query.furnishingStatus = filters.furnishingStatus;
    }

    return this.unitModel.find(query).sort({ unitNumber: 1 }).exec();
  }

  async findOne(companyId: string, id: string): Promise<Unit> {
    const unit = await this.unitModel
      .findOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return unit;
  }

  async update(
    companyId: string,
    id: string,
    updateUnitDto: Partial<CreateUnitDto>,
  ): Promise<Unit> {
    const unit = await this.unitModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          companyId: new Types.ObjectId(companyId),
        },
        { ...updateUnitDto, updatedAt: new Date() },
        { new: true },
      )
      .exec();

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return unit;
  }

  async remove(companyId: string, id: string): Promise<void> {
    const result = await this.unitModel
      .deleteOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }
  }
}
