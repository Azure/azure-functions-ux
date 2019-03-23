import { Test, TestingModule } from '@nestjs/testing';
import { RuntimeTokenService } from './runtime-token.service';

describe('RuntimeTokenService', () => {
  let service: RuntimeTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuntimeTokenService],
    }).compile();

    service = module.get<RuntimeTokenService>(RuntimeTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
