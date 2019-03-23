import { Test, TestingModule } from '@nestjs/testing';
import { OnedriveController } from './onedrive.controller';

describe('Onedrive Controller', () => {
  let controller: OnedriveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OnedriveController],
    }).compile();

    controller = module.get<OnedriveController>(OnedriveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
