import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { StacksController } from './stacks.controller';
import { StacksService20200501 } from './2020-05-01/service/StackService';
import { StacksService20200601 } from './2020-06-01/service/StackService';
import { StacksService20201001 } from './2020-10-01/service/StackService';

@Module({
  imports: [SharedModule],
  controllers: [StacksController],
  providers: [StacksService20200501, StacksService20200601, StacksService20201001],
})
export class StacksModule {}
