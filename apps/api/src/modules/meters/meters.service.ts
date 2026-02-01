import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Meter, MeterDocument } from './schemas/meter.schema';
import { MeterReading, MeterReadingDocument } from './schemas/meter-reading.schema';
import { CreateMeterDto, UpdateMeterDto, CreateMeterReadingDto, UpdateMeterReadingDto } from './dto/create-meter.dto';
import { Service, ServiceDocument } from '../services/schemas/service.schema';

@Injectable()
export class MetersService {
  constructor(
    @InjectModel(Meter.name) private meterModel: Model<MeterDocument>,
    @InjectModel(MeterReading.name) private meterReadingModel: Model<MeterReadingDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) { }

  async create(companyId: string, createMeterDto: CreateMeterDto) {
    const service = await this.serviceModel
      .findOne({
        _id: new (Types.ObjectId as any)(createMeterDto.serviceId),
        companyId: new (Types.ObjectId as any)(companyId),
      })
      .exec();

    if (!service || service.type !== 'metered') {
      throw new BadRequestException('Meters can only be linked to metered services');
    }

    const meter = new this.meterModel({
      ...createMeterDto,
      companyId: new (Types.ObjectId as any)(companyId),
      buildingId: createMeterDto.buildingId ? new (Types.ObjectId as any)(createMeterDto.buildingId) : undefined,
      unitId: createMeterDto.unitId ? new (Types.ObjectId as any)(createMeterDto.unitId) : undefined,
      serviceId: new (Types.ObjectId as any)(createMeterDto.serviceId),
    });
    return meter.save();
  }

  async findAll(companyId: string, type?: string) {
    const filter: any = { companyId: new (Types.ObjectId as any)(companyId) };
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
      .findOne({ _id: new (Types.ObjectId as any)(id), companyId: new (Types.ObjectId as any)(companyId) })
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
        { _id: new (Types.ObjectId as any)(id), companyId: new (Types.ObjectId as any)(companyId) },
        updateMeterDto,
        { new: true },
      )
      .exec();

    if (!meter) throw new NotFoundException('Meter not found');
    return meter;
  }

  async remove(companyId: string, id: string) {
    const result = await this.meterModel
      .deleteOne({ _id: new (Types.ObjectId as any)(id), companyId: new (Types.ObjectId as any)(companyId) })
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
      companyId: new (Types.ObjectId as any)(companyId),
      meterId: new (Types.ObjectId as any)(createReadingDto.meterId),
      readingDate: new Date(createReadingDto.readingDate),
      currentReading,
      previousReading: prevValue,
      consumption,
      notes: createReadingDto.notes,
    });

    const savedReading = await reading.save();

    await this.recalculateMeterReadings(companyId, meter._id);
    return savedReading;
  }

  async findReadings(companyId: string, meterId?: string) {
    const filter: any = { companyId: new (Types.ObjectId as any)(companyId) };
    if (meterId) filter.meterId = new (Types.ObjectId as any)(meterId);

    return this.meterReadingModel
      .find(filter)
      .populate('meterId')
      .sort({ readingDate: -1 })
      .exec();
  }

  async updateReading(companyId: string, id: string, updateReadingDto: UpdateMeterReadingDto) {
    const reading = await this.meterReadingModel
      .findOne({ _id: new (Types.ObjectId as any)(id), companyId: new (Types.ObjectId as any)(companyId) })
      .exec();

    if (!reading) throw new NotFoundException('Reading not found');

    if (updateReadingDto.readingDate) {
      const readingDate = new Date(updateReadingDto.readingDate);
      if (Number.isNaN(readingDate.getTime())) {
        throw new BadRequestException('Invalid reading date');
      }
      const duplicate = await this.meterReadingModel
        .findOne({
          companyId: new (Types.ObjectId as any)(companyId),
          meterId: reading.meterId,
          readingDate,
          _id: { $ne: reading._id },
        })
        .exec();
      if (duplicate) {
        throw new BadRequestException('Reading already exists for this meter and date');
      }
      reading.readingDate = readingDate;
    }

    if (updateReadingDto.currentReading !== undefined) {
      const currentReading = parseFloat(updateReadingDto.currentReading);
      if (Number.isNaN(currentReading)) {
        throw new BadRequestException('Invalid current reading');
      }
      reading.currentReading = currentReading;
    }

    if (updateReadingDto.notes !== undefined) {
      reading.notes = updateReadingDto.notes;
    }

    await reading.save();
    await this.recalculateMeterReadings(companyId, reading.meterId);
    return reading;
  }

  async removeReading(companyId: string, id: string) {
    const reading = await this.meterReadingModel
      .findOne({ _id: new (Types.ObjectId as any)(id), companyId: new (Types.ObjectId as any)(companyId) })
      .exec();

    if (!reading) throw new NotFoundException('Reading not found');

    const meterId = reading.meterId;
    await this.meterReadingModel.deleteOne({ _id: reading._id }).exec();
    await this.recalculateMeterReadings(companyId, meterId);

    return { message: 'Reading deleted successfully' };
  }

  async distributeBuildingMeterConsumption(companyId: string, buildingId: string, readingDate: Date) {
    // Get building meter readings for the date
    const buildingMeters = await this.meterModel
      .find({
        companyId: new (Types.ObjectId as any)(companyId),
        buildingId: new (Types.ObjectId as any)(buildingId),
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
          companyId: new (Types.ObjectId as any)(companyId),
          buildingId: new (Types.ObjectId as any)(buildingId),
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
  private async recalculateMeterReadings(companyId: string, meterId: Types.ObjectId | string) {
    const meterObjectId = typeof meterId === 'string' ? new (Types.ObjectId as any)(meterId) : meterId;
    const readings = await this.meterReadingModel
      .find({
        companyId: new (Types.ObjectId as any)(companyId),
        meterId: meterObjectId,
      })
      .sort({ readingDate: 1 })
      .exec();

    let previous = 0;
    for (const reading of readings) {
      const consumption = reading.currentReading - previous;
      if (reading.previousReading !== previous || reading.consumption !== consumption) {
        reading.previousReading = previous;
        reading.consumption = consumption;
        await reading.save();
      }
      previous = reading.currentReading;
    }
  }

}
