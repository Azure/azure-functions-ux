import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { StacksWebAppConfigService } from './stacks.webapp.config.service';
import { StacksWebAppCreateService } from './stacks.webapp.create.service';
import { StacksFunctionAppConfigService } from './stacks.functionapp.config.service';
import { StacksFunctionAppCreateService } from './stacks.functionapp.create.service';
import { StacksController } from './stacks.controller';

@Module({
  imports: [SharedModule],
  controllers: [StacksController],
  providers: [StacksFunctionAppConfigService, StacksFunctionAppCreateService, StacksWebAppConfigService, StacksWebAppCreateService],
})
export class StacksModule {}
