import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Contract, ContractDocument } from './schemas/contract.schema';
import { CreateContractDto, UpdateContractDto } from './dto/create-contract.dto';
import { UnitsService } from '../units/units.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class ContractsService {
  constructor(
    @InjectModel(Contract.name) private contractModel: Model<ContractDocument>,
    private unitsService: UnitsService,
    private customersService: CustomersService,
  ) { }

  async create(companyId: string, createContractDto: CreateContractDto): Promise<ContractDocument> {
    // Validate dates
    const startDate = new Date(createContractDto.startDate);
    const endDate = new Date(createContractDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check if unit exists and is available
    const unit = await this.unitsService.findOne(companyId, createContractDto.unitId);

    if (unit.status === 'occupied') {
      throw new BadRequestException('Unit is already occupied');
    }

    // Check if customer exists
    await this.customersService.findOne(companyId, createContractDto.customerId);

    // Check for overlapping active contracts for this unit
    const overlapping = await this.contractModel.findOne({
      companyId: new (Types.ObjectId as any)(companyId),
      unitId: new (Types.ObjectId as any)(createContractDto.unitId),
      isActive: true,
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
      ],
    });

    if (overlapping) {
      throw new BadRequestException('Unit has an overlapping active contract');
    }

    // Create contract
    const contract = new this.contractModel({
      ...createContractDto,
      companyId: new (Types.ObjectId as any)(companyId),
      unitId: new (Types.ObjectId as any)(createContractDto.unitId),
      customerId: new (Types.ObjectId as any)(createContractDto.customerId),
      startDate,
      endDate,
    });

    const savedContract = await contract.save();

    // Update unit status to occupied
    await this.unitsService.update(companyId, createContractDto.unitId, {
      status: 'occupied',
    });

    return savedContract;
  }

  async findAll(
    companyId: string,
    filters?: { unitId?: string; customerId?: string; activeOnly?: boolean },
  ): Promise<ContractDocument[]> {
    const query: any = { companyId: new (Types.ObjectId as any)(companyId) };

    if (filters?.unitId) {
      query.unitId = new (Types.ObjectId as any)(filters.unitId);
    }

    if (filters?.customerId) {
      query.customerId = new (Types.ObjectId as any)(filters.customerId);
    }

    if (filters?.activeOnly) {
      query.isActive = true;
    }

    return this.contractModel
      .find(query)
      .populate({
        path: 'unitId',
        populate: { path: 'buildingId' },
      })
      .populate('customerId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(companyId: string, id: string): Promise<ContractDocument> {
    const contract = await this.contractModel
      .findOne({
        _id: new (Types.ObjectId as any)(id),
        companyId: new (Types.ObjectId as any)(companyId),
      })
      .populate({
        path: 'unitId',
        populate: { path: 'buildingId' },
      })
      .populate('customerId')
      .exec();

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  async update(
    companyId: string,
    id: string,
    updateContractDto: UpdateContractDto,
  ): Promise<ContractDocument> {
    // Validate dates if both are provided
    if (updateContractDto.startDate && updateContractDto.endDate) {
      const startDate = new Date(updateContractDto.startDate);
      const endDate = new Date(updateContractDto.endDate);

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    const contract = await this.contractModel
      .findOneAndUpdate(
        {
          _id: new (Types.ObjectId as any)(id),
          companyId: new (Types.ObjectId as any)(companyId),
        },
        { $set: updateContractDto },
        { new: true },
      )
      .populate({
        path: 'unitId',
        populate: { path: 'buildingId' },
      })
      .populate('customerId')
      .exec();

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  async terminate(companyId: string, id: string): Promise<ContractDocument> {
    const contract = await this.findOne(companyId, id);

    if (!contract.isActive) {
      throw new BadRequestException('Contract is already terminated');
    }

    const unitId = this.getContractUnitId(contract);

    // Update contract
    contract.isActive = false;
    await contract.save();

    // Update unit status to available
    await this.unitsService.update(companyId, unitId, {
      status: 'available',
    });

    return contract;
  }

  async reactivate(companyId: string, id: string): Promise<ContractDocument> {
    const contract = await this.findOne(companyId, id);

    if (contract.isActive) {
      throw new BadRequestException('Contract is already active');
    }

    const unitId = this.getContractUnitId(contract);
    const unit = await this.unitsService.findOne(companyId, unitId);

    if (unit.status === 'occupied') {
      throw new BadRequestException('Unit is already occupied');
    }

    const overlapping = await this.contractModel.findOne({
      companyId: new (Types.ObjectId as any)(companyId),
      unitId: new (Types.ObjectId as any)(unitId),
      isActive: true,
      _id: { $ne: contract._id },
    });

    if (overlapping) {
      throw new BadRequestException('Unit has an overlapping active contract');
    }

    contract.isActive = true;
    await contract.save();

    await this.unitsService.update(companyId, unitId, {
      status: 'occupied',
    });

    return contract;
  }

  async remove(companyId: string, id: string): Promise<void> {
    const contract = await this.findOne(companyId, id);

    // If contract is active, update unit status first
    if (contract.isActive) {
      const unitId = this.getContractUnitId(contract);
      await this.unitsService.update(companyId, unitId, {
        status: 'available',
      });
    }

    const result = await this.contractModel
      .deleteOne({
        _id: new (Types.ObjectId as any)(id),
        companyId: new (Types.ObjectId as any)(companyId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Contract not found');
    }
  }

  private getContractUnitId(contract: ContractDocument): string {
    const unitId = contract.unitId as unknown as { _id?: Types.ObjectId } | Types.ObjectId | string;
    if (typeof unitId === 'string') {
      return unitId;
    }
    if (unitId instanceof Types.ObjectId) {
      return unitId.toString();
    }
    if (unitId && unitId._id instanceof Types.ObjectId) {
      return unitId._id.toString();
    }
    return unitId?.toString?.() ?? '';
  }
}
