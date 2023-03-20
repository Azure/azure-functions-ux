import { Injectable } from '@nestjs/common';
import { ArrayUtil } from '../../../utilities/array.util';
import { WebAppCreateStack, WebAppCreateStackVersionPlatform, WebAppCreateStackVersion } from '../models/WebAppStackModel';
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

  getWebAppGitHubActionStacks(os?: 'linux' | 'windows', removeHidden?: boolean): WebAppCreateStack[] {
    const stacks = this.getWebAppCreateStacks(os);

    // remove all supported platforms which are not github action supported.
    stacks.forEach(stack =>
      stack.versions.forEach(version =>
        ArrayUtil.remove<WebAppCreateStackVersionPlatform>(
          version.supportedPlatforms,
          platform => !platform.githubActionSettings || !platform.githubActionSettings.supported || (removeHidden && platform.isHidden)
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
