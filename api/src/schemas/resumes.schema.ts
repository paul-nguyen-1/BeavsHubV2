import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class File extends Document {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true, type: Buffer })
  fileData: Buffer;
  
  @Prop({type: String})
  username: string;

  @Prop({type: [String]})
  companies: string[];

  @Prop({type: [String]})
  positions: string[];

  @Prop({ type: Date, required: true })
  timestamp: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
