import { Module } from '@nestjs/common';
import { WebJobsController } from './webjobs.controller';
import { SharedModule } from '../shared/shared.module';
@Module({
  imports: [SharedModule],
  controllers: [WebJobsController],
})
export class WebJobsModule {}
