import { Test, TestingModule } from '@nestjs/testing';
import { ContainersController } from './containers.controller';

describe('Containers Controller', () => {
  let controller: ContainersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContainersController],
    }).compile();

    controller = module.get<ContainersController>(ContainersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
