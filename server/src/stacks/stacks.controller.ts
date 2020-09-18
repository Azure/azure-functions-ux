import { Controller, Query, HttpException, Post, Get } from '@nestjs/common';
import { Versions } from './versions';
import { StacksService20200501 } from './2020-05-01/service/StackService';
import { StacksService20200601 } from './2020-06-01/service/StackService';
import { AppStackOs } from './2020-06-01/models/AppStackModel';
import { FunctionAppStackValue } from './2020-06-01/models/FunctionAppStackModel';
import { WebAppStackValue } from './2020-06-01/models/WebAppStackModel';

@Controller('stacks')
export class StacksController {
  constructor(private _stackService20200501: StacksService20200501, private _stackService20200601: StacksService20200601) {}

  @Post('webAppCreateStacks')
  webAppCreateStacks(@Query('api-version') apiVersion: string) {
    this._validateApiVersion(apiVersion, [Versions.version20200501]);

    if (apiVersion === Versions.version20200501) {
      return this._stackService20200501.getWebAppCreateStacks();
    }
  }

  @Post('webAppConfigStacks')
  webAppConfigStacks(@Query('api-version') apiVersion: string, @Query('os') os?: 'linux' | 'windows') {
    this._validateApiVersion(apiVersion, [Versions.version20200501]);
    this._validateOs(os);

    if (apiVersion === Versions.version20200501) {
      return this._stackService20200501.getWebAppConfigStacks(os);
    }
  }

  @Post('webAppGitHubActionStacks')
  webAppGitHubActionStacks(@Query('api-version') apiVersion: string, @Query('os') os?: 'linux' | 'windows') {
    this._validateApiVersion(apiVersion, [Versions.version20200501]);
    this._validateOs(os);

    if (apiVersion === Versions.version20200501) {
      return this._stackService20200501.getGitHubActionStacks(os);
    }
  }

  @Post('functionAppStacks')
  functionAppStacksPost(@Query('api-version') apiVersion: string, @Query('removeHiddenStacks') removeHiddenStacks?: string) {
    this._validateApiVersion(apiVersion, [Versions.version20200501]);
    this._validateRemoveHiddenStacks(removeHiddenStacks);
    const removeHidden = removeHiddenStacks && removeHiddenStacks.toLowerCase() === 'true';

    if (apiVersion === Versions.version20200501) {
      return this._stackService20200501.getFunctionAppStacks(removeHidden);
    }
  }

  @Get('functionAppStacks')
  functionAppStacks(
    @Query('api-version') apiVersion: string,
    @Query('os') os?: AppStackOs,
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
      return this._stackService20200601.getFunctionAppStacks(os, stack, removeHidden, removeDeprecated, removePreview);
    }
  }

  @Get('webAppStacks')
  webAppStacks(
    @Query('api-version') apiVersion: string,
    @Query('os') os?: AppStackOs,
    @Query('stack') stack?: WebAppStackValue,
    @Query('removeHiddenStacks') removeHiddenStacks?: string,
    @Query('removeDeprecatedStacks') removeDeprecatedStacks?: string,
    @Query('removePreviewStacks') removePreviewStacks?: string
  ) {
    this._validateApiVersion(apiVersion, [Versions.version20200601]);
    this._validateOs(os);
    this._validateWebAppStack(stack);
    this._validateRemoveHiddenStacks(removeHiddenStacks);
    this._validateRemoveDeprecatedStacks(removeDeprecatedStacks);
    this._validateRemovePreviewStacks(removePreviewStacks);

    const removeHidden = removeHiddenStacks && removeHiddenStacks.toLowerCase() === 'true';
    const removeDeprecated = removeDeprecatedStacks && removeDeprecatedStacks.toLowerCase() === 'true';
    const removePreview = removePreviewStacks && removePreviewStacks.toLowerCase() === 'true';

    if (apiVersion === Versions.version20200601) {
      return this._stackService20200601.getWebAppStacks(os, stack, removeHidden, removeDeprecated, removePreview);
    }
  }

  private _validateOs(os?: AppStackOs) {
    if (os && os.toLowerCase() !== 'linux' && os.toLowerCase() !== 'windows') {
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
        `Incorrect removeDeprecatedStacks '${removeDeprecatedStacks}' provided. Allowed removeDeprecatedStacks values are 'true' or 'false'.`,
        400
      );
    }
  }

  private _validateRemovePreviewStacks(removePreviewStacks?: string) {
    if (removePreviewStacks && removePreviewStacks.toLowerCase() !== 'true' && removePreviewStacks.toLowerCase() !== 'false') {
      throw new HttpException(
        `Incorrect removePreviewStacks '${removePreviewStacks}' provided. Allowed removePreviewStacks values are 'true' or 'false'.`,
        400
      );
    }
  }
}
