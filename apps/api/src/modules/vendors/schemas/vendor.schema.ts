import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VendorDocument = Vendor & Document;

@Schema({ timestamps: true })
export class Vendor {
    @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
    companyId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop()
    contactName?: string;

    @Prop()
    phone?: string;

    @Prop()
    email?: string;

    @Prop()
    address?: string;

    @Prop()
    taxNumber?: string;

    @Prop({ required: true })
    category: string; // e.g., 'Maintenance', 'Utilities', 'Legal', 'Supplies'

    @Prop({ default: true })
    isActive: boolean;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

VendorSchema.index({ companyId: 1, name: 1 });
