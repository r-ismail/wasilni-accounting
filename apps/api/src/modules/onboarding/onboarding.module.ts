import { Module, forwardRef } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { CompaniesModule } from '../companies/companies.module';
import { BuildingsModule } from '../buildings/buildings.module';
import { UnitsModule } from '../units/units.module';
import { ServicesModule } from '../services/services.module';
import { UsersModule } from '../users/users.module';
import { TenantModule } from '../../tenant/tenant.module';

@Module({
  imports: [
    CompaniesModule,
    BuildingsModule,
    UnitsModule,
    ServicesModule,
    forwardRef(() => UsersModule),
    TenantModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
