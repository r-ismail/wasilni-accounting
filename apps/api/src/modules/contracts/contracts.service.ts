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
  ) {}

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
      companyId: new Types.ObjectId(companyId),
      unitId: new Types.ObjectId(createContractDto.unitId),
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
      companyId: new Types.ObjectId(companyId),
      unitId: new Types.ObjectId(createContractDto.unitId),
      customerId: new Types.ObjectId(createContractDto.customerId),
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
    const query: any = { companyId: new Types.ObjectId(companyId) };

    if (filters?.unitId) {
      query.unitId = new Types.ObjectId(filters.unitId);
    }

    if (filters?.customerId) {
      query.customerId = new Types.ObjectId(filters.customerId);
    }

    if (filters?.activeOnly) {
      query.isActive = true;
    }

    return this.contractModel
      .find(query)
      .populate('unitId')
      .populate('customerId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(companyId: string, id: string): Promise<ContractDocument> {
    const contract = await this.contractModel
      .findOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .populate('unitId')
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
          _id: new Types.ObjectId(id),
          companyId: new Types.ObjectId(companyId),
        },
        { $set: updateContractDto },
        { new: true },
      )
      .populate('unitId')
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

    // Update contract
    contract.isActive = false;
    await contract.save();

    // Update unit status to available
    await this.unitsService.update(companyId, contract.unitId.toString(), {
      status: 'available',
    });

    return contract;
  }

  async remove(companyId: string, id: string): Promise<void> {
    const contract = await this.findOne(companyId, id);

    // If contract is active, update unit status first
    if (contract.isActive) {
      await this.unitsService.update(companyId, contract.unitId.toString(), {
        status: 'available',
      });
    }

    const result = await this.contractModel
      .deleteOne({
        _id: new Types.ObjectId(id),
        companyId: new Types.ObjectId(companyId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Contract not found');
    }
  }
}
