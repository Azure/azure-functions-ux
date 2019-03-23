import { Test, TestingModule } from '@nestjs/testing';
import { DropboxController } from './dropbox.controller';

describe('Dropbox Controller', () => {
  let controller: DropboxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DropboxController],
    }).compile();

    controller = module.get<DropboxController>(DropboxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
