import { Controller, Query, HttpException, Post, Get } from '@nestjs/common';
import { Versions, WebAppVersions } from './versions';
import { FunctionAppStacksService20200501 } from './functionapp/2020-05-01/stacks.service';
import { WebAppStacksService20200501 } from './webapp/2020-05-01/stacks.service';
import { WebAppStacksService20200601 } from './webapp/2020-06-01/stacks.service';
import { FunctionAppStacksService20200601 } from './functionapp/2020-06-01/stacks.service';
import { Os, StackValue as FunctionAppStackValue } from './functionapp/2020-06-01/stack.model';
import { StackValue as WebAppStackValue } from './webapp/2020-06-01/stack.model';

@Controller('stacks')
export class StacksController {
  constructor(
    private _stackWebAppService20200501: WebAppStacksService20200501,
    private _stackFunctionAppService20200501: FunctionAppStacksService20200501,
    private _stackWebAppService20200601: WebAppStacksService20200601,
    private _stackFunctionAppService20200601: FunctionAppStacksService20200601
  ) {}

  @Post('webAppCreateStacks')
  webAppCreateStacks(@Query('api-version') apiVersion: string) {
    this._validateApiVersion(apiVersion, WebAppVersions);

    if (apiVersion === Versions.version20200501) {
      return this._stackWebAppService20200501.getCreateStacks();
    }
  }

  @Post('webAppConfigStacks')
  webAppConfigStacks(@Query('api-version') apiVersion: string, @Query('os') os?: 'linux' | 'windows') {
    this._validateApiVersion(apiVersion, WebAppVersions);
    this._validateOs(os);

    if (apiVersion === Versions.version20200501) {
      return this._stackWebAppService20200501.getConfigStacks(os);
    }
  }

  @Post('webAppGitHubActionStacks')
  webAppGitHubActionStacks(@Query('api-version') apiVersion: string, @Query('os') os?: 'linux' | 'windows') {
    this._validateApiVersion(apiVersion, WebAppVersions);
    this._validateOs(os);

    if (apiVersion === Versions.version20200501) {
      return this._stackWebAppService20200501.getGitHubActionStacks(os);
    }
  }

  @Post('functionAppStacks')
  functionAppStacksPost(@Query('api-version') apiVersion: string, @Query('removeHiddenStacks') removeHiddenStacks?: string) {
    this._validateApiVersion(apiVersion, [Versions.version20200501]);
    this._validateRemoveHiddenStacks(removeHiddenStacks);
    const removeHidden = removeHiddenStacks && removeHiddenStacks.toLowerCase() === 'true';

    if (apiVersion === Versions.version20200501) {
      return this._stackFunctionAppService20200501.getStacks(removeHidden);
    }
  }

  @Get('functionAppStacks')
  functionAppStacks(
    @Query('api-version') apiVersion: string,
    @Query('os') os?: Os,
    @Query('stack') stack?: FunctionAppStackValue,
    @Query('removeHiddenStacks') removeHiddenStacks?: string,
    @Query('removeDeprecatedStacks') removeDeprecatedStacks?: string,
    @Query('removePreviewStacks') removePreviewStacks?: string
  ) {
    this._validateApiVersion(apiVersion, [Versions.version20200601]);
    this._validateOs(os);
    this._validateFunctionAppStack(stack);
    this._validateRemoveHiddenStacks(removeHiddenStacks);
    this._validateRemoveDeprecatedStacks(removeDeprecatedStacks);
    this._validateRemovePreviewStacks(removePreviewStacks);

    const removeHidden = removeHiddenStacks && removeHiddenStacks.toLowerCase() === 'true';
    const removeDeprecated = removeDeprecatedStacks && removeDeprecatedStacks.toLowerCase() === 'true';
    const removePreview = removePreviewStacks && removePreviewStacks.toLowerCase() === 'true';

    if (apiVersion === Versions.version20200601) {
      return this._stackFunctionAppService20200601.getStacks(os, stack, removeHidden, removeDeprecated, removePreview);
    }
  }

  @Get('webAppStacks')
  webAppStacks(@Query('api-version') apiVersion: string, @Query('os') os?: 'linux' | 'windows', @Query('stack') stack?: WebAppStackValue) {
    this._validateApiVersion(apiVersion, [Versions.version20200601]);
    this._validateOs(os);
    this._validateWebAppStack(stack);

    if (apiVersion === Versions.version20200601) {
      return this._stackWebAppService20200601.getStacks(os, stack);
    }
  }

  private _validateOs(os?: 'linux' | 'windows') {
    if (os && os !== 'linux' && os !== 'windows') {
      throw new HttpException(`Incorrect os '${os}' provided. Allowed os values are 'linux' or 'windows'.`, 400);
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

  private _validateFunctionAppStack(stack?: FunctionAppStackValue) {
    const stackValues: FunctionAppStackValue[] = ['dotnetCore', 'dotnetFramework', 'java', 'node', 'powershell', 'python', 'custom'];
    if (stack && !stackValues.includes(stack)) {
      throw new HttpException(`Incorrect stack '${stack}' provided. Allowed stack values are ${stackValues.join(', ')}.`, 400);
    }
  }

  private _validateWebAppStack(stack?: WebAppStackValue) {
    const stackValues: WebAppStackValue[] = ['aspnet', 'dotnetcore', 'java', 'javacontainers', 'node', 'php', 'python', 'ruby'];
    if (stack && !stackValues.includes(stack)) {
      throw new HttpException(`Incorrect stack '${stack}' provided. Allowed stack values are ${stackValues.join(', ')}.`, 400);
    }
  }

  private _validateRemoveHiddenStacks(removeHiddenStacks?: string) {
    if (removeHiddenStacks && removeHiddenStacks.toLowerCase() !== 'true' && removeHiddenStacks.toLowerCase() !== 'false') {
      throw new HttpException(
        `Incorrect removeHiddenStacks '${removeHiddenStacks}' provided. Allowed removeHiddenStacks values are 'true' or 'false'.`,
        400
      );
    }
  }

  private _validateRemoveDeprecatedStacks(removeDeprecatedStacks?: string) {
    if (removeDeprecatedStacks && removeDeprecatedStacks.toLowerCase() !== 'true' && removeDeprecatedStacks.toLowerCase() !== 'false') {
      throw new HttpException(
        `Incorrect removeHiddenStacks '${removeDeprecatedStacks}' provided. Allowed removeDeprecatedStacks values are 'true' or 'false'.`,
        400
      );
    }
  }

  private _validateRemovePreviewStacks(removePreviewStacks?: string) {
    if (removePreviewStacks && removePreviewStacks.toLowerCase() !== 'true' && removePreviewStacks.toLowerCase() !== 'false') {
      throw new HttpException(
        `Incorrect removeHiddenStacks '${removePreviewStacks}' provided. Allowed removePreviewStacks values are 'true' or 'false'.`,
        400
      );
    }
  }
}
