import { Injectable } from '@nestjs/common';
import { ArrayUtil } from '../../../utilities/array.util';
import { FunctionAppStack, FunctionAppStackVersionPlatform, FunctionAppStackVersion } from './stack.model';
import { dotnetCoreStack } from './stacks/dotnetCore';
import { nodeStack } from './stacks/node';
import { pythonStack } from './stacks/python';
import { javaStack } from './stacks/java';
import { powershellStack } from './stacks/powershell';
import { customStack } from './stacks/custom';

@Injectable()
export class FunctionAppStacksService20200501 {
  getStacks(removeHiddenStacks?: boolean): FunctionAppStack[] {
    const dotnetCoreStackCopy = JSON.parse(JSON.stringify(dotnetCoreStack));
    const nodeStackCopy = JSON.parse(JSON.stringify(nodeStack));
    const pythonStackCopy = JSON.parse(JSON.stringify(pythonStack));
    const javaStackCopy = JSON.parse(JSON.stringify(javaStack));
    const powershellStackCopy = JSON.parse(JSON.stringify(powershellStack));
    const customStackCopy = JSON.parse(JSON.stringify(customStack));

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
}
