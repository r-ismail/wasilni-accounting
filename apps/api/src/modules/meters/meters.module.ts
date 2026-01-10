import { Module } from '@nestjs/common';
import { TenantMongooseModule } from '../../tenant/tenant-mongoose.module';
import { MetersService } from './meters.service';
import { MetersController } from './meters.controller';
import { Meter, MeterSchema } from './schemas/meter.schema';
import { MeterReading, MeterReadingSchema } from './schemas/meter-reading.schema';
import { Service, ServiceSchema } from '../services/schemas/service.schema';

@Module({
  imports: [
    TenantMongooseModule.forFeature([
      { name: Meter.name, schema: MeterSchema },
      { name: MeterReading.name, schema: MeterReadingSchema },
      { name: Service.name, schema: ServiceSchema },
    ]),
  ],
  controllers: [MetersController],
  providers: [MetersService],
  exports: [MetersService],
})
export class MetersModule {}
