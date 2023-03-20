import { Controller, Query, Post, Get } from '@nestjs/common';
import { Versions } from './versions';
import { StacksService20200501 } from './2020-05-01/service/StackService';
import { StacksService20201001 } from './2020-10-01/service/StackService';
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
import { AppStackOs } from './2020-10-01/models/AppStackModel';

@Controller('stacks')
export class StacksController {
  constructor(private _stackService20200501: StacksService20200501, private _stackService20201001: StacksService20201001) {}

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
    validateApiVersion(apiVersion, Versions.version20201001);
    validateOs(os);
    validateFunctionAppStack(stack);
    validateRemoveHiddenStacks(removeHiddenStacks);
    validateRemoveDeprecatedStacks(removeDeprecatedStacks);
    validateRemovePreviewStacks(removePreviewStacks);
    validateRemoveNonGitHubActionStacks(removeNonGitHubActionStacks);

    const removeHidden = removeHiddenStacks && removeHiddenStacks.toLowerCase() === 'true';
    const removeDeprecated = removeDeprecatedStacks && removeDeprecatedStacks.toLowerCase() === 'true';
    const removePreview = removePreviewStacks && removePreviewStacks.toLowerCase() === 'true';
    const removeNonGitHubAction = removeNonGitHubActionStacks && removeNonGitHubActionStacks.toLowerCase() === 'true';

    if (apiVersion <= Versions.version20201201) {
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

    // For API versions after 2020-12-01, we return dates in ISO format
    return this._stackService20201001.getFunctionAppStacks(
      os,
      stack as FunctionAppStack20201001Value,
      removeHidden,
      removeDeprecated,
      removePreview,
      removeNonGitHubAction
    );
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
    validateApiVersion(apiVersion, Versions.version20201001);
    validateOs(os);
    validateWebAppStack(stack);
    validateRemoveHiddenStacks(removeHiddenStacks);
    validateRemoveDeprecatedStacks(removeDeprecatedStacks);
    validateRemovePreviewStacks(removePreviewStacks);
    validateRemoveNonGitHubActionStacks(removeNonGitHubActionStacks);

    const removeHidden = removeHiddenStacks && removeHiddenStacks.toLowerCase() === 'true';
    const removeDeprecated = removeDeprecatedStacks && removeDeprecatedStacks.toLowerCase() === 'true';
    const removePreview = removePreviewStacks && removePreviewStacks.toLowerCase() === 'true';
    const removeNonGitHubAction = removeNonGitHubActionStacks && removeNonGitHubActionStacks.toLowerCase() === 'true';

    if (apiVersion <= Versions.version20201201) {
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

    // For API versions after 2020-12-01, we return dates in ISO format
    return this._stackService20201001.getWebAppStacks(
      os,
      stack as WebAppStack20201001Value,
      removeHidden,
      removeDeprecated,
      removePreview,
      removeNonGitHubAction
    );
  }

  @Post('webAppGitHubActionStacks')
  webAppGitHubActionStacks(
    @Query('api-version') apiVersion: string,
    @Query('os') os?: 'linux' | 'windows',
    @Query('removeHiddenStacks') removeHiddenStacks?: string
  ) {
    validateApiVersion(apiVersion, Versions.version20200501);
    validateOs(os);

    const removeHidden = removeHiddenStacks && removeHiddenStacks.toLowerCase() === 'true';

    return this._stackService20200501.getWebAppGitHubActionStacks(os, removeHidden);
  }
}
