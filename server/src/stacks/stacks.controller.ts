import { Controller, Query, Post, Get } from '@nestjs/common';
import { Versions } from './versions';
import { StacksService20200501 } from './2020-05-01/service/StackService';
import { StacksService20200601 } from './2020-06-01/service/StackService';
import { StacksService20201001 } from './2020-10-01/service/StackService';
import { AppStackOs } from './2020-06-01/models/AppStackModel';
import { FunctionAppStackValue as FunctionAppStack20200601Value } from './2020-06-01/models/FunctionAppStackModel';
import { WebAppStackValue as WebAppStack20200601Value } from './2020-06-01/models/WebAppStackModel';
import { FunctionAppStackValue as FunctionAppStack20201001Value } from './2020-10-01/models/FunctionAppStackModel';
import { WebAppStackValue as WebAppStack20201001Value } from './2020-10-01/models/WebAppStackModel';
import {
  validateApiVersion,
  validateOs,
  validateRemoveHiddenStacks,
  validateFunctionAppStack,
  validateRemoveDeprecatedStacks,
  validateRemovePreviewStacks,
  validateWebAppStack,
  validateRemoveNonGitHubActionStacks,
} from './validations';

@Controller('stacks')
export class StacksController {
  constructor(
    private _stackService20200501: StacksService20200501,
    private _stackService20200601: StacksService20200601,
    private _stackService20201001: StacksService20201001
  ) {}

  @Get('functionAppStacks')
  functionAppStacks(
    @Query('api-version') apiVersion: string,
    @Query('os') os?: AppStackOs,
    @Query('stack') stack?: string,
    @Query('removeHiddenStacks') removeHiddenStacks?: string,
    @Query('removeDeprecatedStacks') removeDeprecatedStacks?: string,
    @Query('removePreviewStacks') removePreviewStacks?: string,
    @Query('removeNonGitHubActionStacks') removeNonGitHubActionStacks?: string
  ) {
    validateApiVersion(apiVersion, [
      Versions.version20200601,
      Versions.version20201001,
      Versions.version20201201,
      Versions.version20210101,
      Versions.version20210115,
      Versions.version20210201,
      Versions.version20210301,
      Versions.version20220301,
    ]);
    validateOs(os);
    validateFunctionAppStack(apiVersion, stack);
    validateRemoveHiddenStacks(removeHiddenStacks);
    validateRemoveDeprecatedStacks(removeDeprecatedStacks);
    validateRemovePreviewStacks(removePreviewStacks);
    validateRemoveNonGitHubActionStacks(removeNonGitHubActionStacks);

    const removeHidden = removeHiddenStacks && removeHiddenStacks.toLowerCase() === 'true';
    const removeDeprecated = removeDeprecatedStacks && removeDeprecatedStacks.toLowerCase() === 'true';
    const removePreview = removePreviewStacks && removePreviewStacks.toLowerCase() === 'true';
    const removeNonGitHubAction = removeNonGitHubActionStacks && removeNonGitHubActionStacks.toLowerCase() === 'true';

    switch (apiVersion) {
      case Versions.version20200601: {
        return this._stackService20200601.getFunctionAppStacks(
          os,
          stack as FunctionAppStack20200601Value,
          removeHidden,
          removeDeprecated,
          removePreview
        );
      }
      case Versions.version20201001:
      case Versions.version20201201: {
        return this._stackService20201001.getFunctionAppStacks(
          os,
          stack as FunctionAppStack20201001Value,
          removeHidden,
          removeDeprecated,
          removePreview,
          removeNonGitHubAction,
          false /*useIsoDateFormat*/
        );
      }
      case Versions.version20210101:
      case Versions.version20210115:
      case Versions.version20210201:
      case Versions.version20210301:
      case Versions.version20220301: {
        return this._stackService20201001.getFunctionAppStacks(
          os,
          stack as FunctionAppStack20201001Value,
          removeHidden,
          removeDeprecated,
          removePreview,
          removeNonGitHubAction
        );
      }
    }
  }

  @Get('webAppStacks')
  webAppStacks(
    @Query('api-version') apiVersion: string,
    @Query('os') os?: AppStackOs,
    @Query('stack') stack?: string,
    @Query('removeHiddenStacks') removeHiddenStacks?: string,
    @Query('removeDeprecatedStacks') removeDeprecatedStacks?: string,
    @Query('removePreviewStacks') removePreviewStacks?: string,
    @Query('removeNonGitHubActionStacks') removeNonGitHubActionStacks?: string
  ) {
    validateApiVersion(apiVersion, [
      Versions.version20200601,
      Versions.version20201001,
      Versions.version20201201,
      Versions.version20210101,
      Versions.version20210115,
      Versions.version20210201,
      Versions.version20210301,
      Versions.version20220301,
    ]);
    validateOs(os);
    validateWebAppStack(apiVersion, stack);
    validateRemoveHiddenStacks(removeHiddenStacks);
    validateRemoveDeprecatedStacks(removeDeprecatedStacks);
    validateRemovePreviewStacks(removePreviewStacks);
    validateRemoveNonGitHubActionStacks(removeNonGitHubActionStacks);

    const removeHidden = removeHiddenStacks && removeHiddenStacks.toLowerCase() === 'true';
    const removeDeprecated = removeDeprecatedStacks && removeDeprecatedStacks.toLowerCase() === 'true';
    const removePreview = removePreviewStacks && removePreviewStacks.toLowerCase() === 'true';
    const removeNonGitHubAction = removeNonGitHubActionStacks && removeNonGitHubActionStacks.toLowerCase() === 'true';

    switch (apiVersion) {
      case Versions.version20200601: {
        return this._stackService20200601.getWebAppStacks(
          os,
          stack as WebAppStack20200601Value,
          removeHidden,
          removeDeprecated,
          removePreview
        );
      }
      case Versions.version20201001:
      case Versions.version20201201: {
        return this._stackService20201001.getWebAppStacks(
          os,
          stack as WebAppStack20201001Value,
          removeHidden,
          removeDeprecated,
          removePreview,
          removeNonGitHubAction,
          false /*useIsoDateFormat*/
        );
      }
      case Versions.version20210101:
      case Versions.version20210115:
      case Versions.version20210201:
      case Versions.version20210301:
      case Versions.version20220301: {
        return this._stackService20201001.getWebAppStacks(
          os,
          stack as WebAppStack20201001Value,
          removeHidden,
          removeDeprecated,
          removePreview,
          removeNonGitHubAction
        );
      }
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
  webAppGitHubActionStacks(
    @Query('api-version') apiVersion: string,
    @Query('os') os?: 'linux' | 'windows',
    @Query('removeHiddenStacks') removeHiddenStacks?: string
  ) {
    validateApiVersion(apiVersion, [Versions.version20200501]);
    validateOs(os);

    const removeHidden = removeHiddenStacks && removeHiddenStacks.toLowerCase() === 'true';

    if (apiVersion === Versions.version20200501) {
      return this._stackService20200501.getWebAppGitHubActionStacks(os, removeHidden);
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
