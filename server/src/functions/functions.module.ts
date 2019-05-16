import { Module } from '@nestjs/common';
import { FunctionsController } from './functions.controller';
import { FunctionsService } from './functions.service';
import { RuntimeTokenService } from './runtime-token/runtime-token.service';
import { TriggerApimService } from './trigger-apim/trigger-apim.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [FunctionsController],
  providers: [FunctionsService, RuntimeTokenService, TriggerApimService],
})
export class FunctionsModule {}
