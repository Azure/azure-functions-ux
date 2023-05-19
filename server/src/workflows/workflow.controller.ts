import { Controller, Post, Body, Query, HttpException, HttpCode, Put } from '@nestjs/common';
import { Versions } from './versions';
import { WorkflowService20201201 } from './2020-12-01/WorkflowService';
import { AppType, Os, PublishType } from './WorkflowModel';
import { WorkflowService20221001 } from './2022-10-01/WorkflowService';
import { GitHubCommit } from '../deployment-center/github/github';
import { HttpService } from '../shared/http/http.service';
import { LoggingService } from '../shared/logging/logging.service';

@Controller('workflows')
export class WorkflowController {
  private readonly githubApiUrl = 'https://api.github.com';

  constructor(
    private _workflowService20201201: WorkflowService20201201,
    private _workflowService20221001: WorkflowService20221001,
    private loggingService: LoggingService,
    private httpService: HttpService
  ) {}

  @Put('getAndUpdateWorkflow')
  @HttpCode(200)
  async getAndUpdateWorkflowFile(
    @Body('appType') appType: string,
    @Body('publishType') publishType: string,
    @Body('os') os: string,
    @Body('variables') variables: { [key: string]: string },
    @Body('runtimeStack') runtimeStack?: string,
    @Body('authType') authType?: string,
    @Body('gitHubToken') gitHubToken?: string,
    @Body('commit') commit?: GitHubCommit
  ) {
    const workflowFile = this._workflowService20221001.getWorkflowFile(appType, publishType, os, runtimeStack, variables, authType);

    await this._commitFile(gitHubToken, {
      ...commit,
      contentBase64Encoded: Buffer.from(workflowFile).toString('base64'),
    });
  }

  @Post('generate')
  @HttpCode(200)
  generateWorkflow(
    @Query('api-version') apiVersion: string,
    @Body('appType') appType: string,
    @Body('publishType') publishType: string,
    @Body('os') os: string,
    @Body('variables') variables: { [key: string]: string },
    @Body('runtimeStack') runtimeStack?: string,
    @Body('authType') authType?: string
  ) {
    this._validateApiVersion(apiVersion, [Versions.version20201201, Versions.version20221001]);
    this._validateAppType(appType);
    this._validatePublishType(publishType);
    this._validateOs(os);
    this._validateVariables(variables, publishType);
    this._validateRuntimeStack(runtimeStack, publishType);

    if (apiVersion === Versions.version20221001) {
      return this._workflowService20221001.getWorkflowFile(appType, publishType, os, runtimeStack, variables, authType);
    }

    return this._workflowService20201201.getWorkflowFile(appType, publishType, os, runtimeStack, variables);
  }

  private _getAuthorizationHeader(accessToken: string): { Authorization: string } {
    return {
      Authorization: `token ${accessToken}`,
    };
  }

  private async _commitFile(gitHubToken: string, commit: GitHubCommit) {
    const url = `${this.githubApiUrl}/repos/${commit.repoName}/contents/${commit.filePath}`;

    const commitContent = {
      message: commit.message,
      content: commit.contentBase64Encoded,
      sha: commit.sha,
      branch: commit.branchName,
      comitter: commit.committer,
    };

    try {
      await this.httpService.put(url, commitContent, {
        headers: this._getAuthorizationHeader(gitHubToken),
      });
    } catch (err) {
      this.loggingService.error(
        `Failed to commit action workflow '${commit.filePath}' on branch '${commit.branchName}' in repo '${commit.repoName}'.`
      );

      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      }
      throw new HttpException(err, 500);
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
      const codeRequiredVariables = ['sitename', 'slotname', 'runtimeversion', 'branch'];
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

    const runtimeStacks = ['java', 'node', 'python', 'powershell', 'dotnet', 'dotnet-isolated', 'php'];
    if (runtimeStack && !runtimeStacks.includes(runtimeStack.toLocaleLowerCase())) {
      throw new HttpException(`Incorrect runtimeStack '${runtimeStack}' provided. Accepted types are: ${runtimeStacks.join(', ')}.`, 400);
    }
  }
}
