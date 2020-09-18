import { Injectable } from '@nestjs/common';
import { ArrayUtil } from '../../../utilities/array.util';
import { FunctionAppStack, FunctionAppStackVersionPlatform, FunctionAppStackVersion } from '../models/FunctionAppStackModel';
import {
  WebAppConfigStack,
  WebAppCreateStack,
  WebAppCreateStackVersionPlatform,
  WebAppCreateStackVersion,
} from '../models/WebAppStackModel';
import { dotnetCoreStack as dotnetCoreFunctionAppStack } from '../stacks/function-app-stacks/DotnetCore';
import { nodeStack as nodeFunctionAppStack } from '../stacks/function-app-stacks/Node';
import { pythonStack as pythonFunctionAppStack } from '../stacks/function-app-stacks/Python';
import { javaStack as javaFunctionAppStack } from '../stacks/function-app-stacks/Java';
import { powershellStack as powershellFunctionAppStack } from '../stacks/function-app-stacks/Powershell';
import { customStack as customFunctionAppStack } from '../stacks/function-app-stacks/Custom';
import { aspDotnetWindowsConfigStack } from '../stacks/web-app-stacks/config/windows/AspDotnet';
import { nodeWindowsConfigStack } from '../stacks/web-app-stacks/config/windows/Node';
import { pythonWindowsConfigStack } from '../stacks/web-app-stacks/config/windows/Python';
import { phpWindowsConfigStack } from '../stacks/web-app-stacks/config/windows/Php';
import { dotnetCoreWindowsConfigStack } from '../stacks/web-app-stacks/config/windows/DotnetCore';
import { javaWindowsConfigStack } from '../stacks/web-app-stacks/config/windows/Java';
import { javaContainerWindowsConfigStack } from '../stacks/web-app-stacks/config/windows/JavaContainer';
import { nodeLinuxConfigStack } from '../stacks/web-app-stacks/config/linux/Node';
import { pythonLinuxConfigStack } from '../stacks/web-app-stacks/config/linux/Python';
import { phpLinuxConfigStack } from '../stacks/web-app-stacks/config/linux/Php';
import { dotnetCoreLinuxConfigStack } from '../stacks/web-app-stacks/config/linux/DotnetCore';
import { rubyLinuxConfigStack } from '../stacks/web-app-stacks/config/linux/Ruby';
import { java8LinuxConfigStack } from '../stacks/web-app-stacks/config/linux/Java8';
import { java11LinuxConfigStack } from '../stacks/web-app-stacks/config/linux/Java11';
import { aspDotnetCreateStack } from '../stacks/web-app-stacks/create/AspDotnet';
import { nodeCreateStack } from '../stacks/web-app-stacks/create/Node';
import { pythonCreateStack } from '../stacks/web-app-stacks/create/Python';
import { phpCreateStack } from '../stacks/web-app-stacks/create/Php';
import { dotnetCoreCreateStack } from '../stacks/web-app-stacks/create/DotnetCore';
import { rubyCreateStack } from '../stacks/web-app-stacks/create/Ruby';
import { java8CreateStack } from '../stacks/web-app-stacks/create/Java8';
import { java11CreateStack } from '../stacks/web-app-stacks/create/Java11';

@Injectable()
export class StacksService20200501 {
  getFunctionAppStacks(removeHiddenStacks?: boolean): FunctionAppStack[] {
    const dotnetCoreStackCopy = JSON.parse(JSON.stringify(dotnetCoreFunctionAppStack));
    const nodeStackCopy = JSON.parse(JSON.stringify(nodeFunctionAppStack));
    const pythonStackCopy = JSON.parse(JSON.stringify(pythonFunctionAppStack));
    const javaStackCopy = JSON.parse(JSON.stringify(javaFunctionAppStack));
    const powershellStackCopy = JSON.parse(JSON.stringify(powershellFunctionAppStack));
    const customStackCopy = JSON.parse(JSON.stringify(customFunctionAppStack));

    const stacks: FunctionAppStack[] = [
      dotnetCoreStackCopy,
      nodeStackCopy,
      pythonStackCopy,
      javaStackCopy,
      powershellStackCopy,
      customStackCopy,
    ];

    if (!removeHiddenStacks) {
      return stacks;
    }

    // remove all supported platforms where isHidden is true
    stacks.forEach(stack =>
      stack.versions.forEach(version =>
        ArrayUtil.remove<FunctionAppStackVersionPlatform>(version.supportedPlatforms, platform => platform.isHidden)
      )
    );

    // remove all versions which do not have any platforms
    stacks.forEach(stack => ArrayUtil.remove<FunctionAppStackVersion>(stack.versions, version => version.supportedPlatforms.length === 0));

    // remove all stacks which do not have any versions
    ArrayUtil.remove<FunctionAppStack>(stacks, stackItem => stackItem.versions.length === 0);

    return stacks;
  }

  getWebAppConfigStacks(os?: 'linux' | 'windows'): WebAppConfigStack[] {
    const windowsStacks = [
      aspDotnetWindowsConfigStack,
      nodeWindowsConfigStack,
      pythonWindowsConfigStack,
      phpWindowsConfigStack,
      dotnetCoreWindowsConfigStack,
      javaWindowsConfigStack,
      javaContainerWindowsConfigStack,
    ];

    const linuxStacks = [
      nodeLinuxConfigStack,
      pythonLinuxConfigStack,
      phpLinuxConfigStack,
      dotnetCoreLinuxConfigStack,
      rubyLinuxConfigStack,
      java8LinuxConfigStack,
      java11LinuxConfigStack,
    ];

    if (os === 'linux') {
      return linuxStacks;
    }
    if (os === 'windows') {
      return windowsStacks;
    }
    return windowsStacks.concat(linuxStacks);
  }

  getWebAppCreateStacks(os?: 'linux' | 'windows'): WebAppCreateStack[] {
    const aspDotnetCreateStackCopy = JSON.parse(JSON.stringify(aspDotnetCreateStack));
    const nodeCreateStackCopy = JSON.parse(JSON.stringify(nodeCreateStack));
    const pythonCreateStackCopy = JSON.parse(JSON.stringify(pythonCreateStack));
    const phpCreateStackCopy = JSON.parse(JSON.stringify(phpCreateStack));
    const dotnetCoreCreateStackCopy = JSON.parse(JSON.stringify(dotnetCoreCreateStack));
    const rubyCreateStackCopy = JSON.parse(JSON.stringify(rubyCreateStack));
    const java8CreateStackCopy = JSON.parse(JSON.stringify(java8CreateStack));
    const java11CreateStackCopy = JSON.parse(JSON.stringify(java11CreateStack));

    const stacks: WebAppCreateStack[] = [
      aspDotnetCreateStackCopy,
      nodeCreateStackCopy,
      pythonCreateStackCopy,
      phpCreateStackCopy,
      dotnetCoreCreateStackCopy,
      rubyCreateStackCopy,
      java8CreateStackCopy,
      java11CreateStackCopy,
    ];

    if (!os) {
      return stacks;
    }

    // remove all supported platforms which do not support the provided os.
    stacks.forEach(stack =>
      stack.versions.forEach(version =>
        ArrayUtil.remove<WebAppCreateStackVersionPlatform>(version.supportedPlatforms, platform => platform.os !== os)
      )
    );

    // remove all versions which do not have any platforms.
    stacks.forEach(stack => ArrayUtil.remove<WebAppCreateStackVersion>(stack.versions, version => version.supportedPlatforms.length === 0));

    // remove all stacks which do not have any versions.
    ArrayUtil.remove<WebAppCreateStack>(stacks, stackItem => stackItem.versions.length === 0);

    return stacks;
  }

  getWebAppGitHubActionStacks(os?: 'linux' | 'windows'): WebAppCreateStack[] {
    const stacks = this.getWebAppCreateStacks(os);

    // remove all supported platforms which are not github action supported.
    stacks.forEach(stack =>
      stack.versions.forEach(version =>
        ArrayUtil.remove<WebAppCreateStackVersionPlatform>(
          version.supportedPlatforms,
          platform => !platform.githubActionSettings || !platform.githubActionSettings.supported
        )
      )
    );

    // remove all versions which do not have any platforms.
    stacks.forEach(stack => ArrayUtil.remove<WebAppCreateStackVersion>(stack.versions, version => version.supportedPlatforms.length === 0));

    // remove all stacks which do not have any versions.
    ArrayUtil.remove<WebAppCreateStack>(stacks, stackItem => stackItem.versions.length === 0);

    return stacks;
  }
}
