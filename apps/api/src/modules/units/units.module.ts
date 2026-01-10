import { Module } from '@nestjs/common';
import { TenantMongooseModule } from '../../tenant/tenant-mongoose.module';
import { UnitsController } from './units.controller';
import { UnitsService } from './units.service';
import { Unit, UnitSchema } from './schemas/unit.schema';

@Module({
  imports: [
    TenantMongooseModule.forFeature([{ name: Unit.name, schema: UnitSchema }]),
  ],
  controllers: [UnitsController],
  providers: [UnitsService],
  exports: [UnitsService],
})
export class UnitsModule {}
