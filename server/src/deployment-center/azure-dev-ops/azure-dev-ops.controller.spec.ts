import { Test, TestingModule } from '@nestjs/testing';
import { AzureDevOpsController } from './azure-dev-ops.controller';

describe('AzureDevOps Controller', () => {
  let controller: AzureDevOpsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AzureDevOpsController],
    }).compile();

    controller = module.get<AzureDevOpsController>(AzureDevOpsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
