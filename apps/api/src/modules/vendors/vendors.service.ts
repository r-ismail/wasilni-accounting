import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vendor, VendorDocument } from './schemas/vendor.schema';
import { CreateVendorDto, UpdateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorsService {
    constructor(
        @InjectModel(Vendor.name) private vendorModel: Model<VendorDocument>,
    ) { }

    async create(companyId: string, dto: CreateVendorDto): Promise<VendorDocument> {
        const vendor = new this.vendorModel({
            ...dto,
            companyId: new Types.ObjectId(companyId),
        });
        return vendor.save();
    }

    async findAll(companyId: string): Promise<VendorDocument[]> {
        return this.vendorModel
            .find({ companyId: new Types.ObjectId(companyId) })
            .sort({ name: 1 })
            .exec();
    }

    async findOne(id: string): Promise<VendorDocument> {
        const vendor = await this.vendorModel.findById(id).exec();
        if (!vendor) {
            throw new NotFoundException('Vendor not found');
        }
        return vendor;
    }

    async update(id: string, dto: UpdateVendorDto): Promise<VendorDocument> {
        const vendor = await this.vendorModel
            .findByIdAndUpdate(id, { $set: dto }, { new: true })
            .exec();

        if (!vendor) {
            throw new NotFoundException('Vendor not found');
        }
        return vendor;
    }

    async remove(id: string): Promise<void> {
        const result = await this.vendorModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException('Vendor not found');
        }
    }
}
