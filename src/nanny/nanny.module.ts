import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NannyController } from './nanny.controller';
import { NannyService } from './nanny.service';
import { Nanny, NannySchema } from './schemas/nanny.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Nanny.name, schema: NannySchema }]),
  ],
  controllers: [NannyController],
  providers: [NannyService],
  exports: [NannyService],
})
export class NannyModule {}
