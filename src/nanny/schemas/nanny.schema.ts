import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Review, ReviewSchema } from './review.schema';

export type NannyDocument = HydratedDocument<Nanny>;

@Schema({
  timestamps: true,
})
export class Nanny {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  avatar_url: string;

  @Prop({ required: true })
  birthday: Date;

  @Prop({ required: true })
  experience: string;

  @Prop({
    type: [ReviewSchema],
    default: [],
  })
  reviews: Review[];

  @Prop({ required: true })
  education: string;

  @Prop({ required: true })
  kids_age: string;

  @Prop({ required: true })
  price_per_hour: number;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  about: string;

  @Prop({
    type: [String],
    default: [],
  })
  characters: string[];

  @Prop({ required: true })
  rating: number;
}

export const NannySchema = SchemaFactory.createForClass(Nanny);
