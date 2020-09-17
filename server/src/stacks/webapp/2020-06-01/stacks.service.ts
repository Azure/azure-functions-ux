import { Injectable } from '@nestjs/common';
import { WebAppStack, WebAppRuntimes, WebAppMajorVersion, JavaContainers, WebAppMinorVersion, StackValue } from './stack.model';
import { dotnetCoreStack } from './stacks/dotnetCore';
import { javaStack } from './stacks/java';
import { aspDotnetStack } from './stacks/aspDotnet';
import { nodeStack } from './stacks/node';
import { rubyStack } from './stacks/ruby';
import { pythonStack } from './stacks/python';
import { phpStack } from './stacks/php';
import { javaContainersStack } from './stacks/javaContainers';
import { ArrayUtil } from '../../../utilities/array.util';

@Injectable()
export class WebAppStacksService20200601 {
  getStacks(os?: 'linux' | 'windows', stackValue?: StackValue): WebAppStack<WebAppRuntimes | JavaContainers>[] {
    const aspDotnetStackCopy = JSON.parse(JSON.stringify(aspDotnetStack));
    const nodeStackCopy = JSON.parse(JSON.stringify(nodeStack));
    const pythonStackCopy = JSON.parse(JSON.stringify(pythonStack));
    const phpStackCopy = JSON.parse(JSON.stringify(phpStack));
    const dotnetCoreStackCopy = JSON.parse(JSON.stringify(dotnetCoreStack));
    const rubyStackCopy = JSON.parse(JSON.stringify(rubyStack));
    const javaStackCopy = JSON.parse(JSON.stringify(javaStack));
    const javaContainersStackCopy = JSON.parse(JSON.stringify(javaContainersStack));

    let stacks: WebAppStack<WebAppRuntimes & JavaContainers>[] = [
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

    return !os ? stacks : this._filterStacks(stacks, os);
  }

  private _filterStacks(
    stacks: WebAppStack<WebAppRuntimes & JavaContainers>[],
    os?: 'linux' | 'windows'
  ): WebAppStack<WebAppRuntimes & JavaContainers>[] {
    stacks.forEach((stack, i) => {
      stack.majorVersions.forEach((majorVersion, j) => {
        majorVersion.minorVersions.forEach((minorVersion, k) => {
          // Remove runtime settings and container settings if they do not meet filters
          if (os) {
            this._removeUnsupportedOsRuntimeAndContainerSettings(stacks, i, j, k, os);
          }
        });

        // Remove Minor Versions without Runtime Settings and Container Settings
        ArrayUtil.remove<WebAppMinorVersion<WebAppRuntimes & JavaContainers>>(majorVersion.minorVersions, minorVersion => {
          return (
            !minorVersion.stackSettings.windowsRuntimeSettings &&
            !minorVersion.stackSettings.linuxRuntimeSettings &&
            !minorVersion.stackSettings.windowsContainerSettings &&
            !minorVersion.stackSettings.linuxContainerSettings
          );
        });
      });

      // Remove Major Versions without Minor Versions
      ArrayUtil.remove<WebAppMajorVersion<WebAppRuntimes & JavaContainers>>(stack.majorVersions, majorVersion => {
        return majorVersion.minorVersions.length === 0;
      });
    });

    // Remove Stacks without Major Versions
    ArrayUtil.remove<WebAppStack<WebAppRuntimes & JavaContainers>>(stacks, stack => stack.majorVersions.length === 0);
    return stacks;
  }

  private _removeUnsupportedOsRuntimeAndContainerSettings(
    stacks: WebAppStack<WebAppRuntimes & JavaContainers>[],
    i: number,
    j: number,
    k: number,
    os: 'linux' | 'windows'
  ): void {
    if (os === 'linux') {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsContainerSettings;
    } else if (os === 'windows') {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxContainerSettings;
    }
  }
}
