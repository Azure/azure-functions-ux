import { Injectable } from '@nestjs/common';
import { AppStackOs } from '../models/AppStackModel';
import { FunctionAppStack, FunctionAppStackValue } from '../models/FunctionAppStackModel';
import { WebAppStack, WebAppStackValue } from '../models/WebAppStackModel';
import { filterFunctionAppStacks } from './FunctionAppUtility';
import { filterWebAppStacks } from './WebAppUtility';
import { dotnetCoreStack as dotnetCoreFunctionAppStack } from '../stacks/function-app-stacks/DotnetCore';
import { nodeStack as nodeFunctionAppStack } from '../stacks/function-app-stacks/Node';
import { pythonStack as pythonFunctionAppStack } from '../stacks/function-app-stacks/Python';
import { javaStack as javaFunctionAppStack } from '../stacks/function-app-stacks/Java';
import { powershellStack as powershellFunctionappStack } from '../stacks/function-app-stacks/Powershell';
import { dotnetFrameworkStack as dotnetFrameworkFunctionAppStack } from '../stacks/function-app-stacks/DotnetFramework';
import { customStack as customFunctionAppStack } from '../stacks/function-app-stacks/Custom';
import { aspDotnetStack as aspDotnetWebAppStack } from '../stacks/web-app-stacks/AspDotnet';
import { nodeStack as nodeWebAppStack } from '../stacks/web-app-stacks/Node';
import { pythonStack as pythonWebAppStack } from '../stacks/web-app-stacks/Python';
import { phpStack as phpWebAppStack } from '../stacks/web-app-stacks/Php';
import { rubyStack as rubyWebAppStack } from '../stacks/web-app-stacks/Ruby';
import { dotnetCoreStack as dotnetCoreWebAppStack } from '../stacks/web-app-stacks/DotnetCore';
import { javaStack as javaWebAppStack } from '../stacks/web-app-stacks/Java';
import { javaContainersStack as javaContainersWebAppStack } from '../stacks/web-app-stacks/JavaContainers';

@Injectable()
export class StacksService20200601 {
  getFunctionAppStacks(
    os?: AppStackOs,
    stackValue?: FunctionAppStackValue,
    removeHiddenStacks?: boolean,
    removeDeprecatedStacks?: boolean,
    removePreviewStacks?: boolean
  ): FunctionAppStack[] {
    const dotnetCoreStackCopy = JSON.parse(JSON.stringify(dotnetCoreFunctionAppStack));
    const nodeStackCopy = JSON.parse(JSON.stringify(nodeFunctionAppStack));
    const pythonStackCopy = JSON.parse(JSON.stringify(pythonFunctionAppStack));
    const javaStackCopy = JSON.parse(JSON.stringify(javaFunctionAppStack));
    const powershellStackCopy = JSON.parse(JSON.stringify(powershellFunctionappStack));
    const dotnetFrameworkStackCopy = JSON.parse(JSON.stringify(dotnetFrameworkFunctionAppStack));
    const customStackCopy = JSON.parse(JSON.stringify(customFunctionAppStack));

    let stacks: FunctionAppStack[] = [
      dotnetCoreStackCopy,
      nodeStackCopy,
      pythonStackCopy,
      javaStackCopy,
      powershellStackCopy,
      dotnetFrameworkStackCopy,
      customStackCopy,
    ];

    if (stackValue) {
      stacks = [stacks.find(stack => stack.value === stackValue)];
    }

    return !os && !removeHiddenStacks && !removeDeprecatedStacks && !removePreviewStacks
      ? stacks
      : filterFunctionAppStacks(stacks, os, removeHiddenStacks, removeDeprecatedStacks, removePreviewStacks);
  }

  getWebAppStacks(
    os?: AppStackOs,
    stackValue?: WebAppStackValue,
    removeHiddenStacks?: boolean,
    removeDeprecatedStacks?: boolean,
    removePreviewStacks?: boolean
  ): WebAppStack[] {
    const aspDotnetStackCopy = JSON.parse(JSON.stringify(aspDotnetWebAppStack));
    const nodeStackCopy = JSON.parse(JSON.stringify(nodeWebAppStack));
    const pythonStackCopy = JSON.parse(JSON.stringify(pythonWebAppStack));
    const phpStackCopy = JSON.parse(JSON.stringify(phpWebAppStack));
    const dotnetCoreStackCopy = JSON.parse(JSON.stringify(dotnetCoreWebAppStack));
    const rubyStackCopy = JSON.parse(JSON.stringify(rubyWebAppStack));
    const javaStackCopy = JSON.parse(JSON.stringify(javaWebAppStack));
    const javaContainersStackCopy = JSON.parse(JSON.stringify(javaContainersWebAppStack));

    let stacks: WebAppStack[] = [
      aspDotnetStackCopy,
      nodeStackCopy,
      pythonStackCopy,
      phpStackCopy,
      dotnetCoreStackCopy,
      rubyStackCopy,
      javaStackCopy,
      javaContainersStackCopy,
    ];

    if (stackValue) {
      stacks = [stacks.find(stack => stack.value === stackValue)];
    }

    return !os && !removeHiddenStacks && !removeDeprecatedStacks && !removePreviewStacks
      ? stacks
      : filterWebAppStacks(stacks, os, removeHiddenStacks, removeDeprecatedStacks, removePreviewStacks);
  }
}
