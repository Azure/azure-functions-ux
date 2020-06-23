import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { StacksController } from './stacks.controller';
import { WebAppStacksService20200501 } from './webapp/2020-05-01/stacks.service';
import { FunctionAppStacksService20200501 } from './functionapp/2020-05-01/stacks.service';
import { WebAppStacksService20200601 } from './webapp/2020-06-01/stacks.service';
import { FunctionAppStacksService20200601 } from './functionapp/2020-06-01/stacks.service';

@Module({
  imports: [SharedModule],
  controllers: [StacksController],
  providers: [WebAppStacksService20200501, FunctionAppStacksService20200501, WebAppStacksService20200601, FunctionAppStacksService20200601],
})
export class StacksModule {}
