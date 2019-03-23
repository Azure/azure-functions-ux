import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentCenterController } from './deployment-center.controller';

describe('DeploymentCenter Controller', () => {
  let controller: DeploymentCenterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeploymentCenterController],
    }).compile();

    controller = module.get<DeploymentCenterController>(DeploymentCenterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
