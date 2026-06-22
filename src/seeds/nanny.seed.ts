import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Nanny, NannyDocument } from '../nanny/schemas/nanny.schema';
import { nannyData } from './nanny.data';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const nannyModel = app.get<Model<NannyDocument>>(getModelToken(Nanny.name));

  await nannyModel.deleteMany({});

  const docs = nannyData.map((item) => ({
    ...item,
    birthday: new Date(item.birthday),
  }));

  await nannyModel.insertMany(docs);

  console.log(`Seeded ${docs.length} nannies`);
  await app.close();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
