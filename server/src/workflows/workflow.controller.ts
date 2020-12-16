import { Controller, Post, Body, Query, HttpException } from '@nestjs/common';
import { Versions } from './versions';
import { AppType, CodeVariables, ContainerVariables, FunctionAppRuntimeStack, Os, PublishType, WebAppRuntimeStack } from './WorkflowModel';
import { WorkflowService20201201 } from './WorkflowService';

@Controller()
export class WorkflowController {
  constructor(private _workflowService20201201: WorkflowService20201201) {}

  @Post('workflows/generate')
  functionAppStacks(
    @Query('apiVersion') apiVersion: string,
    @Body('appType') appType: AppType,
    @Body('publishType') publishType: PublishType,
    @Body('os') os: Os,
    @Body('variables') variables: CodeVariables | ContainerVariables,
    @Body('runtimeStack') runtimeStack?: FunctionAppRuntimeStack | WebAppRuntimeStack
  ) {
    this._validateApiVersion(apiVersion, [Versions.version20201201]);

    switch (apiVersion) {
      case Versions.version20201201: {
        return this._workflowService20201201.getWorkflowFile(appType, publishType, os, runtimeStack, variables);
      }
    }
  }

  private _validateApiVersion(apiVersion: string, acceptedVersions: string[]) {
    if (!apiVersion) {
      throw new HttpException(`Missing 'api-version' query parameter. Allowed versions are: ${acceptedVersions.join(', ')}.`, 400);
    }

    if (!acceptedVersions.includes(apiVersion)) {
      throw new HttpException(`Incorrect api-version '${apiVersion}' provided. Allowed versions are: ${acceptedVersions.join(', ')}.`, 400);
    }
  }
}
