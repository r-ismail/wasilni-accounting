import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto } from '@aqarat/shared';

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) { }

  async create(createCompanyDto: CreateCompanyDto): Promise<CompanyDocument> {
    const slugBase = this.slugify(createCompanyDto.name);
    const slug = slugBase || `company-${Date.now()}`;
    const company = new this.companyModel({ ...createCompanyDto, slug });
    return company.save();
  }

  async findById(id: string): Promise<CompanyDocument | null> {
    if (!this.companyModel?.findById) {
      this.logger.error('companyModel not initialized; cannot call findById');
      return null;
    }
    return this.companyModel.findById(id);
  }

  async findBySlug(slug: string): Promise<CompanyDocument | null> {
    if (!this.companyModel?.findOne) {
      this.logger.error('companyModel not initialized; cannot call findOne');
      return null;
    }
    return this.companyModel.findOne({ slug });
  }

  async markSetupCompleted(id: string): Promise<void> {
    if (!this.companyModel?.findByIdAndUpdate) {
      this.logger.error('companyModel not initialized; cannot mark setup completed');
      return;
    }
    await this.companyModel.findByIdAndUpdate(id, { setupCompleted: true });
  }

  async update(id: string, updateData: Partial<Company>): Promise<CompanyDocument | null> {
    if (!this.companyModel?.findByIdAndUpdate) {
      this.logger.error('companyModel not initialized; cannot update company');
      return null;
    }
    return this.companyModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
  }

  async updateLogo(id: string, logo: string): Promise<CompanyDocument | null> {
    if (!this.companyModel?.findByIdAndUpdate) {
      this.logger.error('companyModel not initialized; cannot update logo');
      return null;
    }
    return this.companyModel.findByIdAndUpdate(
      id,
      { logo },
      { new: true }
    );
  }

  async findAll(): Promise<CompanyDocument[]> {
    if (!this.companyModel?.find) {
      this.logger.error('companyModel not initialized; cannot findAll');
      return [];
    }
    return this.companyModel.find();
  }

  async deleteById(id: string): Promise<void> {
    if (!this.companyModel?.findByIdAndDelete) {
      this.logger.error('companyModel not initialized; cannot delete company');
      return;
    }
    await this.companyModel.findByIdAndDelete(id);
  }

  async getCompanyDbName(companyId: string): Promise<string> {
    const company = await this.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }
    const slugBase =
      company.slug ||
      this.slugify(company.name) ||
      `company-${company._id.toString()}`;
    return this.sanitizeDbName(slugBase);
  }

  private sanitizeDbName(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
