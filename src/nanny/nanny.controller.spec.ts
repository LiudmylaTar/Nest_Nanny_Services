import { Test, TestingModule } from '@nestjs/testing';
import { NannyController } from './nanny.controller';

describe('NannyController', () => {
  let controller: NannyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NannyController],
    }).compile();

    controller = module.get<NannyController>(NannyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
