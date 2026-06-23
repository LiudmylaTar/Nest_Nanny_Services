import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { NannyController } from './nanny.controller';
import { NannyService } from './nanny.service';
import { Nanny, NannySchema } from './schemas/nanny.schema';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Nanny.name, schema: NannySchema }]),
    AuthModule,
    UsersModule,
  ],
  controllers: [NannyController],
  providers: [NannyService],
  exports: [NannyService],
})
export class NannyModule {}
