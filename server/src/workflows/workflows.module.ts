import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { WorkflowService20221001 } from './2022-10-01/WorkflowService';
import { WorkflowService20201201 } from './2020-12-01/WorkflowService';
import { WorkflowController } from './workflow.controller';

@Module({
  imports: [SharedModule],
  controllers: [WorkflowController],
  providers: [WorkflowService20201201, WorkflowService20221001],
})
export class WorkflowModule {}
