import { Controller, Post, Body, Query, HttpException, HttpCode, Get } from '@nestjs/common';
import { Versions } from './versions';
import { WorkflowService20201201 } from './2020-12-01/WorkflowService';

@Controller('workflows')
export class WorkflowController {
  constructor(private _workflowService20201201: WorkflowService20201201) {}

  @Post('generate')
  @HttpCode(200)
  generateWorkflow(
    @Query('api-version') apiVersion: string,
    @Body('appType') appType: string,
    @Body('publishType') publishType: string,
    @Body('os') os: string,
    @Body('variables') variables: { [key: string]: string },
    @Body('runtimeStack') runtimeStack?: string
  ) {
    this._validateApiVersion(apiVersion, [Versions.version20201201]);

    return this._workflowService20201201.getWorkflowFile(appType, publishType, os, runtimeStack, variables);
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
