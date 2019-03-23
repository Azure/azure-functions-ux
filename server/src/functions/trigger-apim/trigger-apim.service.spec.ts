import { Test, TestingModule } from '@nestjs/testing';
import { TriggerApimService } from './trigger-apim.service';

describe('TriggerApimService', () => {
  let service: TriggerApimService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TriggerApimService],
    }).compile();

    service = module.get<TriggerApimService>(TriggerApimService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
