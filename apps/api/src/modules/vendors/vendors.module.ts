import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { Vendor, VendorSchema } from './schemas/vendor.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }]),
    ],
    controllers: [VendorsController],
    providers: [VendorsService],
    exports: [VendorsService], // Export service in case Expenses needs it validation
})
export class VendorsModule { }
