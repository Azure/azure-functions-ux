import { Test, TestingModule } from '@nestjs/testing';
import { ContainersService } from './containers.service';

describe('ContainersService', () => {
  let service: ContainersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContainersService],
    }).compile();

    service = module.get<ContainersService>(ContainersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
