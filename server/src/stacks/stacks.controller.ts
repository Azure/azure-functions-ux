import { Controller, Query, Post, Get } from '@nestjs/common';
import { Versions } from './versions';
import { StacksService20200501 } from './2020-05-01/service/StackService';
import { StacksService20200601 } from './2020-06-01/service/StackService';
import { AppStackOs } from './2020-06-01/models/AppStackModel';
import { FunctionAppStackValue } from './2020-06-01/models/FunctionAppStackModel';
import { WebAppStackValue } from './2020-06-01/models/WebAppStackModel';
import {
  validateApiVersion,
  validateOs,
  validateRemoveHiddenStacks,
  validateFunctionAppStack,
  validateRemoveDeprecatedStacks,
  validateRemovePreviewStacks,
  validateWebAppStack,
} from './validations';

@Controller('stacks')
export class StacksController {
  constructor(private _stackService20200501: StacksService20200501, private _stackService20200601: StacksService20200601) {}

  @Get('functionAppStacks')
  functionAppStacks(
    @Query('api-version') apiVersion: string,
    @Query('os') os?: AppStackOs,
    @Query('stack') stack?: FunctionAppStackValue,
    @Query('removeHiddenStacks') removeHiddenStacks?: string,
    @Query('removeDeprecatedStacks') removeDeprecatedStacks?: string,
    @Query('removePreviewStacks') removePreviewStacks?: string
  ) {
    validateApiVersion(apiVersion, [Versions.version20200601]);
    validateOs(os);
    validateFunctionAppStack(stack);
    validateRemoveHiddenStacks(removeHiddenStacks);
    validateRemoveDeprecatedStacks(removeDeprecatedStacks);
    validateRemovePreviewStacks(removePreviewStacks);

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
    validateApiVersion(apiVersion, [Versions.version20200601]);
    validateOs(os);
    validateWebAppStack(stack);
    validateRemoveHiddenStacks(removeHiddenStacks);
    validateRemoveDeprecatedStacks(removeDeprecatedStacks);
    validateRemovePreviewStacks(removePreviewStacks);

    const removeHidden = removeHiddenStacks && removeHiddenStacks.toLowerCase() === 'true';
    const removeDeprecated = removeDeprecatedStacks && removeDeprecatedStacks.toLowerCase() === 'true';
    const removePreview = removePreviewStacks && removePreviewStacks.toLowerCase() === 'true';

    if (apiVersion === Versions.version20200601) {
      return this._stackService20200601.getWebAppStacks(os, stack, removeHidden, removeDeprecated, removePreview);
    }
  }

  // Note (allisonm): 2020-05-01 should not be used, please use 2020-06-01 instead
  @Post('webAppCreateStacks')
  webAppCreateStacks(@Query('api-version') apiVersion: string) {
    validateApiVersion(apiVersion, [Versions.version20200501]);

    if (apiVersion === Versions.version20200501) {
      return this._stackService20200501.getWebAppCreateStacks();
    }
  }

  @Post('webAppConfigStacks')
  webAppConfigStacks(@Query('api-version') apiVersion: string, @Query('os') os?: 'linux' | 'windows') {
    validateApiVersion(apiVersion, [Versions.version20200501]);
    validateOs(os);

    if (apiVersion === Versions.version20200501) {
      return this._stackService20200501.getWebAppConfigStacks(os);
    }
  }

  @Post('webAppGitHubActionStacks')
  webAppGitHubActionStacks(@Query('api-version') apiVersion: string, @Query('os') os?: 'linux' | 'windows') {
    validateApiVersion(apiVersion, [Versions.version20200501]);
    validateOs(os);

    if (apiVersion === Versions.version20200501) {
      return this._stackService20200501.getWebAppGitHubActionStacks(os);
    }
  }

  @Post('functionAppStacks')
  functionAppStacksPost(@Query('api-version') apiVersion: string, @Query('removeHiddenStacks') removeHiddenStacks?: string) {
    validateApiVersion(apiVersion, [Versions.version20200501]);
    validateRemoveHiddenStacks(removeHiddenStacks);
    const removeHidden = removeHiddenStacks && removeHiddenStacks.toLowerCase() === 'true';

    if (apiVersion === Versions.version20200501) {
      return this._stackService20200501.getFunctionAppStacks(removeHidden);
    }
  }
}
