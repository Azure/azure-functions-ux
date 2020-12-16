import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { WorkflowController } from 'src/workflows/workflow.controller';
import { WorkflowService20201201 } from './2020-12-01/WorkflowService';

@Module({
  imports: [SharedModule],
  controllers: [WorkflowController],
  providers: [WorkflowService20201201],
})
export class WorkflowModule {}
