import { Module } from '@nestjs/common';
import { TenantMongooseModule } from '../../tenant/tenant-mongoose.module';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { Vendor, VendorSchema } from './schemas/vendor.schema';

@Module({
  imports: [
        TenantMongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
  ],
    controllers: [VendorsController],
    providers: [VendorsService],
    exports: [VendorsService], // Export service in case Expenses needs it validation
})
export class VendorsModule { }
