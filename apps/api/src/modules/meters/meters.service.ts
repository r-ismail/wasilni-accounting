import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meter, MeterDocument } from './schemas/meter.schema';
import { MeterReading, MeterReadingDocument } from './schemas/meter-reading.schema';
import { CreateMeterDto, UpdateMeterDto, CreateMeterReadingDto } from './dto/create-meter.dto';

@Injectable()
export class MetersService {
  constructor(
    @InjectModel(Meter.name) private meterModel: Model<MeterDocument>,
    @InjectModel(MeterReading.name) private meterReadingModel: Model<MeterReadingDocument>,
  ) {}

  async create(companyId: string, createMeterDto: CreateMeterDto) {
    const meter = new this.meterModel({
      ...createMeterDto,
      companyId: new Types.ObjectId(companyId),
      buildingId: createMeterDto.buildingId ? new Types.ObjectId(createMeterDto.buildingId) : undefined,
      unitId: createMeterDto.unitId ? new Types.ObjectId(createMeterDto.unitId) : undefined,
      serviceId: new Types.ObjectId(createMeterDto.serviceId),
    });
    return meter.save();
  }

  async findAll(companyId: string, type?: string) {
    const filter: any = { companyId: new Types.ObjectId(companyId) };
    if (type) filter.type = type;
    
    return this.meterModel
      .find(filter)
      .populate('serviceId', 'name type')
      .populate('buildingId', 'name')
      .populate('unitId', 'unitNumber')
      .exec();
  }

  async findOne(companyId: string, id: string) {
    const meter = await this.meterModel
      .findOne({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .populate('serviceId')
      .populate('buildingId')
      .populate('unitId')
      .exec();
    
    if (!meter) throw new NotFoundException('Meter not found');
    return meter;
  }

  async update(companyId: string, id: string, updateMeterDto: UpdateMeterDto) {
    const meter = await this.meterModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) },
        updateMeterDto,
        { new: true },
      )
      .exec();
    
    if (!meter) throw new NotFoundException('Meter not found');
    return meter;
  }

  async remove(companyId: string, id: string) {
    const result = await this.meterModel
      .deleteOne({ _id: new Types.ObjectId(id), companyId: new Types.ObjectId(companyId) })
      .exec();
    
    if (result.deletedCount === 0) throw new NotFoundException('Meter not found');
    return { message: 'Meter deleted successfully' };
  }

  // Meter Readings
  async createReading(companyId: string, createReadingDto: CreateMeterReadingDto) {
    const meter = await this.findOne(companyId, createReadingDto.meterId);
    
    // Get previous reading
    const previousReading = await this.meterReadingModel
      .findOne({ meterId: meter._id })
      .sort({ readingDate: -1 })
      .exec();

    const currentReading = parseFloat(createReadingDto.currentReading);
    const prevValue = previousReading?.currentReading || 0;
    const consumption = currentReading - prevValue;

    const reading = new this.meterReadingModel({
      companyId: new Types.ObjectId(companyId),
      meterId: new Types.ObjectId(createReadingDto.meterId),
      readingDate: new Date(createReadingDto.readingDate),
      currentReading,
      previousReading: prevValue,
      consumption,
      notes: createReadingDto.notes,
    });

    return reading.save();
  }

  async findReadings(companyId: string, meterId?: string) {
    const filter: any = { companyId: new Types.ObjectId(companyId) };
    if (meterId) filter.meterId = new Types.ObjectId(meterId);

    return this.meterReadingModel
      .find(filter)
      .populate('meterId')
      .sort({ readingDate: -1 })
      .exec();
  }

  async distributeBuildingMeterConsumption(companyId: string, buildingId: string, readingDate: Date) {
    // Get building meter readings for the date
    const buildingMeters = await this.meterModel
      .find({
        companyId: new Types.ObjectId(companyId),
        buildingId: new Types.ObjectId(buildingId),
        type: 'building',
      })
      .exec();

    const distributions = [];

    for (const meter of buildingMeters) {
      const reading = await this.meterReadingModel
        .findOne({
          meterId: meter._id,
          readingDate: { $gte: readingDate, $lt: new Date(readingDate.getTime() + 86400000) },
        })
        .exec();

      if (!reading || !reading.consumption) continue;

      // Get all unit meters for this service in the building
      const unitMeters = await this.meterModel
        .find({
          companyId: new Types.ObjectId(companyId),
          buildingId: new Types.ObjectId(buildingId),
          serviceId: meter.serviceId,
          type: 'unit',
        })
        .populate('unitId')
        .exec();

      // Calculate total unit consumption
      let totalUnitConsumption = 0;
      const unitConsumptions = [];

      for (const unitMeter of unitMeters) {
        const unitReading = await this.meterReadingModel
          .findOne({
            meterId: unitMeter._id,
            readingDate: { $gte: readingDate, $lt: new Date(readingDate.getTime() + 86400000) },
          })
          .exec();

        if (unitReading && unitReading.consumption) {
          totalUnitConsumption += unitReading.consumption;
          unitConsumptions.push({
            unitId: unitMeter.unitId,
            consumption: unitReading.consumption,
          });
        }
      }

      // Calculate shared consumption
      const sharedConsumption = reading.consumption - totalUnitConsumption;
      const distributionPerUnit = sharedConsumption / unitMeters.length;

      distributions.push({
        meter: meter,
        totalConsumption: reading.consumption,
        totalUnitConsumption,
        sharedConsumption,
        distributionPerUnit,
        units: unitConsumptions.map(uc => ({
          ...uc,
          finalConsumption: uc.consumption + distributionPerUnit,
        })),
      });
    }

    return distributions;
  }
}
