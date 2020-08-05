import { Injectable } from '@nestjs/common';
import { ArrayUtil } from '../../../utilities/array.util';
import { FunctionAppStack, FunctionAppMajorVersion, FunctionAppMinorVersion, Os, StackValue } from './stack.model';
import { dotnetCoreStack } from './stacks/dotnetCore';
import { nodeStack } from './stacks/node';
import { pythonStack } from './stacks/python';
import { javaStack } from './stacks/java';
import { powershellStack } from './stacks/powershell';
import { dotnetFrameworkStack } from './stacks/dotnetFramework';
import { customStack } from './stacks/custom';

@Injectable()
export class FunctionAppStacksService20200601 {
  getStacks(os?: Os, stackValue?: StackValue, removeHiddenStacks?: boolean): FunctionAppStack[] {
    const dotnetCoreStackCopy = JSON.parse(JSON.stringify(dotnetCoreStack));
    const nodeStackCopy = JSON.parse(JSON.stringify(nodeStack));
    const pythonStackCopy = JSON.parse(JSON.stringify(pythonStack));
    const javaStackCopy = JSON.parse(JSON.stringify(javaStack));
    const powershellStackCopy = JSON.parse(JSON.stringify(powershellStack));
    const dotnetFrameworkStackCopy = JSON.parse(JSON.stringify(dotnetFrameworkStack));
    const customStackCopy = JSON.parse(JSON.stringify(customStack));

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

    return !os && !removeHiddenStacks ? stacks : this._filterStacks(stacks, os, removeHiddenStacks);
  }

  private _filterStacks(stacks: FunctionAppStack[], os?: Os, removeHiddenStacks?: boolean): FunctionAppStack[] {
    stacks.forEach((stack, i) => {
      stack.majorVersions.forEach((majorVersion, j) => {
        majorVersion.minorVersions.forEach((minorVersion, k) => {
          // Set Runtimes Settings as undefined if they do not meet filters
          this._setUndefinedByOs(stacks, i, j, k, os);
          this._setUndefinedByHidden(stacks, i, j, k, removeHiddenStacks);
        });
        // Remove Minor Versions without Runtime Settings
        ArrayUtil.remove<FunctionAppMinorVersion>(majorVersion.minorVersions, minorVersion => {
          return !minorVersion.stackSettings.windowsRuntimeSettings && !minorVersion.stackSettings.linuxRuntimeSettings;
        });
      });
      // Remove Major Versions without Minor Versions
      ArrayUtil.remove<FunctionAppMajorVersion>(stack.majorVersions, majorVersion => {
        return majorVersion.minorVersions.length === 0;
      });
    });

    // Remove Stacks without Major Versions
    ArrayUtil.remove<FunctionAppStack>(stacks, stack => stack.majorVersions.length === 0);
    return stacks;
  }

  private _setUndefinedByOs(stacks: FunctionAppStack[], i: number, j: number, k: number, os?: Os): void {
    if (os === 'linux') {
      stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings = undefined;
    } else if (os === 'windows') {
      stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings = undefined;
    }
  }

  private _setUndefinedByHidden(stacks: FunctionAppStack[], i: number, j: number, k: number, removeHiddenStacks?: boolean): void {
    if (removeHiddenStacks) {
      const windowsRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
      const linuxRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;

      if (windowsRuntimeSettings && windowsRuntimeSettings.isHidden) {
        stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings = undefined;
      }

      if (linuxRuntimeSettings && linuxRuntimeSettings.isHidden) {
        stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings = undefined;
      }
    }
  }
}
