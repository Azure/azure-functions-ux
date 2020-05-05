import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { StacksController } from './stacks.controller';
import { WebAppStacksService20200501 } from './webapp/2020-05-01/stacks.service';
import { FunctionAppStacksService20200501 } from './functionapp/2020-05-01/stacks.service';

@Module({
  imports: [SharedModule],
  controllers: [StacksController],
  providers: [WebAppStacksService20200501, FunctionAppStacksService20200501],
})
export class StacksModule {}
