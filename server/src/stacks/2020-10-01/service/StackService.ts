import { Injectable } from '@nestjs/common';
import { AppStackOs } from '../models/AppStackModel';
import { FunctionAppStack, FunctionAppStackValue } from '../models/FunctionAppStackModel';
import { WebAppStack, WebAppStackValue } from '../models/WebAppStackModel';
import { filterFunctionAppStacks } from './FunctionAppUtility';
import { filterWebAppStacks } from './WebAppUtility';
import { dotnetStack as dotnetFunctionAppStack } from '../stacks/function-app-stacks/Dotnet';
import { nodeStack as nodeFunctionAppStack } from '../stacks/function-app-stacks/Node';
import { pythonStack as pythonFunctionAppStack } from '../stacks/function-app-stacks/Python';
import { javaStack as javaFunctionAppStack } from '../stacks/function-app-stacks/Java';
import {
  powershellStack as powershellFunctionappStack,
  powershellStackNonIsoDates as powershellFunctionappStackNonIsoDates,
} from '../stacks/function-app-stacks/Powershell';
import { customStack as customFunctionAppStack } from '../stacks/function-app-stacks/Custom';
import { dotnetStack as dotnetWebAppStack, dotnetStackNonIsoDates as dotnetWebAppStackNonIsoDates } from '../stacks/web-app-stacks/Dotnet';
import { nodeStack as nodeWebAppStack, nodeStackNonIsoDates as nodeWebAppStackNonIsoDates } from '../stacks/web-app-stacks/Node';
import { pythonStack as pythonWebAppStack, pythonStackNonIsoDates as pythonWebAppStackNonIsoDates } from '../stacks/web-app-stacks/Python';
import { phpStack as phpWebAppStack, phpStackNonIsoDates as phpWebAppStackNonIsoDates } from '../stacks/web-app-stacks/Php';
import { rubyStack as rubyWebAppStack, rubyStackNonIsoDates as rubyWebAppStackNonIsoDates } from '../stacks/web-app-stacks/Ruby';
import { javaStack as javaWebAppStack, javaStackNonIsoDates as javaWebAppStackNonIsoDates } from '../stacks/web-app-stacks/Java';
import { javaContainersStack as javaContainersWebAppStack } from '../stacks/web-app-stacks/JavaContainers';
import { staticSiteStack as staticSiteWebAppStack } from '../stacks/web-app-stacks/StaticSite';
import { golangStack, golangStackWithNonIsoDates } from '../stacks/web-app-stacks/Golang';

@Injectable()
export class StacksService20201001 {
  getFunctionAppStacks(
    os?: AppStackOs,
    stackValue?: FunctionAppStackValue,
    removeHiddenStacks?: boolean,
    removeDeprecatedStacks?: boolean,
    removePreviewStacks?: boolean,
    removeNonGitHubActionStacks?: boolean,
    useIsoDateFormat: boolean = true
  ): FunctionAppStack[] {
    const dotnetStackCopy = JSON.parse(JSON.stringify(dotnetFunctionAppStack));
    const nodeStackCopy = JSON.parse(JSON.stringify(nodeFunctionAppStack));
    const pythonStackCopy = JSON.parse(JSON.stringify(pythonFunctionAppStack));
    const javaStackCopy = JSON.parse(JSON.stringify(javaFunctionAppStack));
    const powershellStackCopy = JSON.parse(
      JSON.stringify(useIsoDateFormat ? powershellFunctionappStack : powershellFunctionappStackNonIsoDates)
    );
    const customStackCopy = JSON.parse(JSON.stringify(customFunctionAppStack));

    let stacks: FunctionAppStack[] = [dotnetStackCopy, nodeStackCopy, pythonStackCopy, javaStackCopy, powershellStackCopy, customStackCopy];

    if (stackValue) {
      stacks = [stacks.find(stack => stack.value === stackValue)];
    }

    return this._hasNoFilterFlags(os, removeHiddenStacks, removeDeprecatedStacks, removePreviewStacks, removeNonGitHubActionStacks)
      ? stacks
      : filterFunctionAppStacks(stacks, os, removeHiddenStacks, removeDeprecatedStacks, removePreviewStacks, removeNonGitHubActionStacks);
  }

  getWebAppStacks(
    os?: AppStackOs,
    stackValue?: WebAppStackValue,
    removeHiddenStacks?: boolean,
    removeDeprecatedStacks?: boolean,
    removePreviewStacks?: boolean,
    removeNonGitHubActionStacks?: boolean,
    useIsoDateFormat: boolean = true
  ): WebAppStack[] {
    const dotnetStackCopy = JSON.parse(JSON.stringify(useIsoDateFormat ? dotnetWebAppStack : dotnetWebAppStackNonIsoDates));
    const nodeStackCopy = JSON.parse(JSON.stringify(useIsoDateFormat ? nodeWebAppStack : nodeWebAppStackNonIsoDates));
    const pythonStackCopy = JSON.parse(JSON.stringify(useIsoDateFormat ? pythonWebAppStack : pythonWebAppStackNonIsoDates));
    const phpStackCopy = JSON.parse(JSON.stringify(useIsoDateFormat ? phpWebAppStack : phpWebAppStackNonIsoDates));
    const rubyStackCopy = JSON.parse(JSON.stringify(useIsoDateFormat ? rubyWebAppStack : rubyWebAppStackNonIsoDates));
    const javaStackCopy = JSON.parse(JSON.stringify(useIsoDateFormat ? javaWebAppStack : javaWebAppStackNonIsoDates));
    const javaContainersStackCopy = JSON.parse(JSON.stringify(javaContainersWebAppStack));
    const staticSiteStackCopy = JSON.parse(JSON.stringify(staticSiteWebAppStack));
    const goStackCopy = JSON.parse(JSON.stringify(useIsoDateFormat ? golangStack : golangStackWithNonIsoDates));

    let stacks: WebAppStack[] = [
      dotnetStackCopy,
      nodeStackCopy,
      pythonStackCopy,
      phpStackCopy,
      rubyStackCopy,
      javaStackCopy,
      javaContainersStackCopy,
      staticSiteStackCopy,
      goStackCopy,
    ];

    if (stackValue) {
      stacks = [stacks.find(stack => stack.value === stackValue)];
    }

    return this._hasNoFilterFlags(os, removeHiddenStacks, removeDeprecatedStacks, removePreviewStacks, removeNonGitHubActionStacks)
      ? stacks
      : filterWebAppStacks(stacks, os, removeHiddenStacks, removeDeprecatedStacks, removePreviewStacks, removeNonGitHubActionStacks);
  }

  private _hasNoFilterFlags(
    os?: AppStackOs,
    removeHiddenStacks?: boolean,
    removeDeprecatedStacks?: boolean,
    removePreviewStacks?: boolean,
    removeNonGitHubActionStacks?: boolean
  ): boolean {
    return !os && !removeHiddenStacks && !removeDeprecatedStacks && !removePreviewStacks && !removeNonGitHubActionStacks;
  }
}
