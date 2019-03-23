import { Test, TestingModule } from '@nestjs/testing';
import { DeploymentCenterService } from './deployment-center.service';

describe('DeploymentCenterService', () => {
  let service: DeploymentCenterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeploymentCenterService],
    }).compile();

    service = module.get<DeploymentCenterService>(DeploymentCenterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
