import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto } from '@aqarat/shared';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<CompanyDocument> {
    const company = new this.companyModel(createCompanyDto);
    return company.save();
  }

  async findById(id: string): Promise<CompanyDocument | null> {
    return this.companyModel.findById(id);
  }

  async markSetupCompleted(id: string): Promise<void> {
    await this.companyModel.findByIdAndUpdate(id, { setupCompleted: true });
  }

  async update(id: string, updateData: Partial<Company>): Promise<CompanyDocument | null> {
    return this.companyModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async updateLogo(id: string, logo: string): Promise<CompanyDocument | null> {
    return this.companyModel.findByIdAndUpdate(
      id,
      { logo },
      { new: true }
    );
  }
}
