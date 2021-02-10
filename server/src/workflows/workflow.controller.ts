import { Controller, Post, Body, Query, HttpException, HttpCode, Get } from '@nestjs/common';
import { Versions } from './versions';
import { WorkflowService20201201 } from './2020-12-01/WorkflowService';
import { AppType, Os, PublishType } from './WorkflowModel';

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
    this._validateAppType(appType);
    this._validatePublishType(publishType);
    this._validateOs(os);
    this._validateVariables(variables, publishType);
    this._validateRuntimeStack(runtimeStack, publishType);

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

  private _validateAppType(appType: string) {
    if (!appType) {
      throw new HttpException(
        `Missing 'appType' in the request body. Accepted types are: '${AppType.WebApp}' and '${AppType.FunctionApp}'.`,
        400
      );
    }

    const providedAppType = appType.toLocaleLowerCase();
    if (providedAppType !== AppType.WebApp && providedAppType !== AppType.FunctionApp) {
      throw new HttpException(
        `Incorrect appType '${appType}' provided. Accepted types are '${AppType.WebApp}' and '${AppType.FunctionApp}'.`,
        400
      );
    }
  }

  private _validatePublishType(publishType: string) {
    if (!publishType) {
      throw new HttpException(
        `Missing 'publishType' in the request body. Accepted types are: '${PublishType.Code}' and '${PublishType.Container}'.`,
        400
      );
    }

    const providedPublishType = publishType.toLocaleLowerCase();
    if (providedPublishType !== PublishType.Code && providedPublishType !== PublishType.Container) {
      throw new HttpException(
        `Incorrect publishType '${publishType}' provided. Accepted types are '${PublishType.Code}' and '${PublishType.Container}'.`,
        400
      );
    }
  }

  private _validateOs(os: string) {
    if (!os) {
      throw new HttpException(`Missing 'os' in the request body.`, 400);
    }

    const providedOs = os.toLocaleLowerCase();
    if (providedOs !== Os.Linux && providedOs !== Os.Windows) {
      throw new HttpException(`Incorrect os '${os}' provided. Accepted types are '${Os.Linux}' and '${Os.Windows}'.`, 400);
    }
  }

  private _validateVariables(variables: { [key: string]: string }, publishType: string) {
    if (!variables || Object.keys(variables).length === 0) {
      throw new HttpException(`Missing 'variables' in the request body.`, 400);
    }

    if (publishType.toLocaleLowerCase() === PublishType.Code) {
      const codeRequiredVariables = ['sitename', 'slotname', 'runtimeversion', 'publishingprofilesecretname', 'branch'];
      this._validateRequiredVariables(codeRequiredVariables, variables);
    } else {
      const containerRequiredVariables = [
        'sitename',
        'slotname',
        'branch',
        'loginserver',
        'publishserver',
        'image',
        'containerusersecretname',
        'containerpasswordsecretname',
        'publishingprofilesecretname',
      ];
      this._validateRequiredVariables(containerRequiredVariables, variables);
    }
  }

  private _validateRequiredVariables(requiredVariables: string[], variables: { [key: string]: string }) {
    requiredVariables.forEach(requiredVar => {
      if (!Object.keys(variables).find(key => key.toLocaleLowerCase() === requiredVar)) {
        throw new HttpException(`Missing variable '${requiredVar}'.`, 400);
      }
    });
  }

  private _validateRuntimeStack(runtimeStack: string, publishType: string) {
    if (publishType.toLocaleLowerCase() === PublishType.Code && !runtimeStack) {
      throw new HttpException(`Missing 'runtimeStack' in the request body.`, 400);
    }

    const runtimeStacks = ['java', 'node', 'python', 'powershell', 'dotnet'];
    if (runtimeStack && !runtimeStacks.includes(runtimeStack.toLocaleLowerCase())) {
      throw new HttpException(`Incorrect runtimeStack '${runtimeStack}' provided. Accepted types are: ${runtimeStacks.join(', ')}.`, 400);
    }
  }
}
