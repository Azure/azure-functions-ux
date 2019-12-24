import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { StacksWebAppConfigService } from './stacks.webapp.config.service';
import { StacksWebAppCreateService } from './stacks.webapp.create.service';
import { StacksFunctionAppConfigService } from './stacks.functionapp.config.service';
import { StacksFunctionAppCreateService } from './stacks.functionapp.create.service';
import { StacksWebAppCreateController } from './stacks.webapp.create.controller';
import { StacksWebAppConfigController } from './stacks.webapp.config.controller';
import { StacksFunctionAppConfigController } from './stacks.functionapp.config.controller';
import { StacksFunctionAppCreateController } from './stacks.functionapp.create.controller';

@Module({
  imports: [SharedModule],
  controllers: [
    StacksFunctionAppConfigController,
    StacksFunctionAppCreateController,
    StacksWebAppConfigController,
    StacksWebAppCreateController,
  ],
  providers: [StacksFunctionAppConfigService, StacksFunctionAppCreateService, StacksWebAppConfigService, StacksWebAppCreateService],
})
export class StacksModule {}
