import { Module } from '@nestjs/common';
import { TenantMongooseModule } from '../../tenant/tenant-mongoose.module';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service, ServiceSchema } from './schemas/service.schema';
import { Building, BuildingSchema } from '../buildings/schemas/building.schema';

@Module({
  imports: [
    TenantMongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema },
      { name: Building.name, schema: BuildingSchema },
    ]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
