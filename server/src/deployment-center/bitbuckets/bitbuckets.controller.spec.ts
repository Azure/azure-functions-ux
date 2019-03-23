import { Test, TestingModule } from '@nestjs/testing';
import { BitbucketsController } from './bitbuckets.controller';

describe('Bitbuckets Controller', () => {
  let controller: BitbucketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BitbucketsController],
    }).compile();

    controller = module.get<BitbucketsController>(BitbucketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
