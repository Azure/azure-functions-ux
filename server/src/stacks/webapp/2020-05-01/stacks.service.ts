import { Injectable } from '@nestjs/common';
import { ArrayUtil } from '../../../utilities/array.util';
import { WebAppConfigStack, WebAppCreateStack, WebAppCreateStackVersionPlatform, WebAppCreateStackVersion } from './stack.model';
import { aspDotnetWindowsConfigStack } from './stacks/config/windows/aspDotnet';
import { nodeWindowsConfigStack } from './stacks/config/windows/node';
import { pythonWindowsConfigStack } from './stacks/config/windows/python';
import { phpWindowsConfigStack } from './stacks/config/windows/php';
import { dotnetCoreWindowsConfigStack } from './stacks/config/windows/dotnetCore';
import { javaWindowsConfigStack } from './stacks/config/windows/java';
import { javaContainerWindowsConfigStack } from './stacks/config/windows/javaContainer';
import { nodeLinuxConfigStack } from './stacks/config/linux/node';
import { pythonLinuxConfigStack } from './stacks/config/linux/python';
import { phpLinuxConfigStack } from './stacks/config/linux/php';
import { dotnetCoreLinuxConfigStack } from './stacks/config/linux/dotnetCore';
import { rubyLinuxConfigStack } from './stacks/config/linux/ruby';
import { java8LinuxConfigStack } from './stacks/config/linux/java8';
import { java11LinuxConfigStack } from './stacks/config/linux/java11';
import { aspDotnetCreateStack } from './stacks/create/aspDotnet';
import { nodeCreateStack } from './stacks/create/node';
import { pythonCreateStack } from './stacks/create/python';
import { phpCreateStack } from './stacks/create/php';
import { dotnetCoreCreateStack } from './stacks/create/dotnetCore';
import { rubyCreateStack } from './stacks/create/ruby';
import { java8CreateStack } from './stacks/create/java8';
import { java11CreateStack } from './stacks/create/java11';

@Injectable()
export class WebAppStacksService20200501 {
  getConfigStacks(os?: 'linux' | 'windows'): WebAppConfigStack[] {
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

  getCreateStacks(os?: 'linux' | 'windows'): WebAppCreateStack[] {
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

  getGitHubActionStacks(os?: 'linux' | 'windows'): WebAppCreateStack[] {
    const stacks = this.getCreateStacks(os);

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
