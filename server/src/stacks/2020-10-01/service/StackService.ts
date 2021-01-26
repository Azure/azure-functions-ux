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
import { powershellStack as powershellFunctionappStack } from '../stacks/function-app-stacks/Powershell';
import { customStack as customFunctionAppStack } from '../stacks/function-app-stacks/Custom';
import { dotnetStack as dotnetWebAppStack } from '../stacks/web-app-stacks/Dotnet';
import { nodeStack as nodeWebAppStack } from '../stacks/web-app-stacks/Node';
import { pythonStack as pythonWebAppStack } from '../stacks/web-app-stacks/Python';
import { phpStack as phpWebAppStack } from '../stacks/web-app-stacks/Php';
import { rubyStack as rubyWebAppStack } from '../stacks/web-app-stacks/Ruby';
import { javaStack as javaWebAppStack } from '../stacks/web-app-stacks/Java';
import { javaContainersStack as javaContainersWebAppStack } from '../stacks/web-app-stacks/JavaContainers';

@Injectable()
export class StacksService20201001 {
  getFunctionAppStacks(
    os?: AppStackOs,
    stackValue?: FunctionAppStackValue,
    removeHiddenStacks?: boolean,
    removeDeprecatedStacks?: boolean,
    removePreviewStacks?: boolean,
    removeGitHubActionUnsupportedStacks?: boolean
  ): FunctionAppStack[] {
    const dotnetStackCopy = JSON.parse(JSON.stringify(dotnetFunctionAppStack));
    const nodeStackCopy = JSON.parse(JSON.stringify(nodeFunctionAppStack));
    const pythonStackCopy = JSON.parse(JSON.stringify(pythonFunctionAppStack));
    const javaStackCopy = JSON.parse(JSON.stringify(javaFunctionAppStack));
    const powershellStackCopy = JSON.parse(JSON.stringify(powershellFunctionappStack));
    const customStackCopy = JSON.parse(JSON.stringify(customFunctionAppStack));

    let stacks: FunctionAppStack[] = [dotnetStackCopy, nodeStackCopy, pythonStackCopy, javaStackCopy, powershellStackCopy, customStackCopy];

    if (stackValue) {
      stacks = [stacks.find(stack => stack.value === stackValue)];
    }

    return this._hasNoFilterFlags(os, removeHiddenStacks, removeDeprecatedStacks, removePreviewStacks, removeGitHubActionUnsupportedStacks)
      ? stacks
      : filterFunctionAppStacks(
          stacks,
          os,
          removeHiddenStacks,
          removeDeprecatedStacks,
          removePreviewStacks,
          removeGitHubActionUnsupportedStacks
        );
  }

  getWebAppStacks(
    os?: AppStackOs,
    stackValue?: WebAppStackValue,
    removeHiddenStacks?: boolean,
    removeDeprecatedStacks?: boolean,
    removePreviewStacks?: boolean,
    removeGitHubActionUnsupportedStacks?: boolean
  ): WebAppStack[] {
    const dotnetStackCopy = JSON.parse(JSON.stringify(dotnetWebAppStack));
    const nodeStackCopy = JSON.parse(JSON.stringify(nodeWebAppStack));
    const pythonStackCopy = JSON.parse(JSON.stringify(pythonWebAppStack));
    const phpStackCopy = JSON.parse(JSON.stringify(phpWebAppStack));
    const rubyStackCopy = JSON.parse(JSON.stringify(rubyWebAppStack));
    const javaStackCopy = JSON.parse(JSON.stringify(javaWebAppStack));
    const javaContainersStackCopy = JSON.parse(JSON.stringify(javaContainersWebAppStack));

    let stacks: WebAppStack[] = [
      dotnetStackCopy,
      nodeStackCopy,
      pythonStackCopy,
      phpStackCopy,
      rubyStackCopy,
      javaStackCopy,
      javaContainersStackCopy,
    ];

    if (stackValue) {
      stacks = [stacks.find(stack => stack.value === stackValue)];
    }

    return this._hasNoFilterFlags(os, removeHiddenStacks, removeDeprecatedStacks, removePreviewStacks, removeGitHubActionUnsupportedStacks)
      ? stacks
      : filterWebAppStacks(
          stacks,
          os,
          removeHiddenStacks,
          removeDeprecatedStacks,
          removePreviewStacks,
          removeGitHubActionUnsupportedStacks
        );
  }

  private _hasNoFilterFlags(
    os?: AppStackOs,
    removeHiddenStacks?: boolean,
    removeDeprecatedStacks?: boolean,
    removePreviewStacks?: boolean,
    removeGitHubActionUnsupportedStacks?: boolean
  ): boolean {
    return !os && !removeHiddenStacks && !removeDeprecatedStacks && !removePreviewStacks && !removeGitHubActionUnsupportedStacks;
  }
}
