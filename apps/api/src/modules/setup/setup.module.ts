import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';
import { Company, CompanySchema } from '../companies/schemas/company.schema';
import { CompaniesModule } from '../companies/companies.module';
import { BuildingsModule } from '../buildings/buildings.module';
import { UnitsModule } from '../units/units.module';
import { ServicesModule } from '../services/services.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    forwardRef(() => CompaniesModule),
    BuildingsModule,
    UnitsModule,
    ServicesModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [SetupController],
  providers: [SetupService],
  exports: [SetupService],
})
export class SetupModule {}
