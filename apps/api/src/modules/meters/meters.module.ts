import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetersService } from './meters.service';
import { MetersController } from './meters.controller';
import { Meter, MeterSchema } from './schemas/meter.schema';
import { MeterReading, MeterReadingSchema } from './schemas/meter-reading.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Meter.name, schema: MeterSchema },
      { name: MeterReading.name, schema: MeterReadingSchema },
    ]),
  ],
  controllers: [MetersController],
  providers: [MetersService],
  exports: [MetersService],
})
export class MetersModule {}
