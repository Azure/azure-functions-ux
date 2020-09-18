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
  getStacks(
    os?: 'linux' | 'windows',
    stackValue?: StackValue,
    removeHiddenStacks?: boolean,
    removeDeprecatedStacks?: boolean,
    removePreviewStacks?: boolean
  ): WebAppStack<WebAppRuntimes | JavaContainers>[] {
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

    return !os && !removeHiddenStacks && !removeDeprecatedStacks && !removePreviewStacks
      ? stacks
      : this._filterStacks(stacks, os, removeHiddenStacks, removeDeprecatedStacks, removePreviewStacks);
  }

  private _filterStacks(
    stacks: WebAppStack<WebAppRuntimes | JavaContainers>[],
    os?: 'linux' | 'windows',
    removeHiddenStacks?: boolean,
    removeDeprecatedStacks?: boolean,
    removePreviewStacks?: boolean
  ): WebAppStack<WebAppRuntimes | JavaContainers>[] {
    stacks.forEach((stack, i) => {
      stack.majorVersions.forEach((majorVersion, j) => {
        majorVersion.minorVersions.forEach((minorVersion, k) => {
          // Remove runtime settings and container settings if they do not meet filters
          if (os) {
            this._removeUnsupportedOsRuntimeAndContainerSettings(stacks, i, j, k, os);
          }
          if (removeHiddenStacks) {
            this._removeHiddenRuntimeAndContainerSettings(stacks, i, j, k);
          }
          if (removeDeprecatedStacks) {
            this._removeDeprecatedRuntimeAndContainerSettings(stacks, i, j, k);
          }
          if (removePreviewStacks) {
            this._removePreviewRuntimeAndContainerSettings(stacks, i, j, k);
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
      ArrayUtil.remove<WebAppMajorVersion<WebAppRuntimes | JavaContainers>>(stack.majorVersions, majorVersion => {
        return majorVersion.minorVersions.length === 0;
      });
    });

    // Remove Stacks without Major Versions
    ArrayUtil.remove<WebAppStack<WebAppRuntimes | JavaContainers>>(stacks, stack => stack.majorVersions.length === 0);
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

  private _removeHiddenRuntimeAndContainerSettings(
    stacks: WebAppStack<WebAppRuntimes & JavaContainers>[],
    i: number,
    j: number,
    k: number
  ): void {
    const windowsRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
    const linuxRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
    const windowsContainerSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsContainerSettings;
    const linuxContainerSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxContainerSettings;

    if (windowsRuntimeSettings && windowsRuntimeSettings.isHidden) {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
    }

    if (linuxRuntimeSettings && linuxRuntimeSettings.isHidden) {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
    }

    if (windowsContainerSettings && windowsContainerSettings.isHidden) {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsContainerSettings;
    }

    if (linuxContainerSettings && linuxContainerSettings.isHidden) {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxContainerSettings;
    }
  }

  private _removeDeprecatedRuntimeAndContainerSettings(
    stacks: WebAppStack<WebAppRuntimes & JavaContainers>[],
    i: number,
    j: number,
    k: number
  ): void {
    const windowsRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
    const linuxRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
    const windowsContainerSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsContainerSettings;
    const linuxContainerSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxContainerSettings;

    if (windowsRuntimeSettings && windowsRuntimeSettings.isDeprecated) {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
    }

    if (linuxRuntimeSettings && linuxRuntimeSettings.isDeprecated) {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
    }

    if (windowsContainerSettings && windowsContainerSettings.isDeprecated) {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsContainerSettings;
    }

    if (linuxContainerSettings && linuxContainerSettings.isDeprecated) {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxContainerSettings;
    }
  }

  private _removePreviewRuntimeAndContainerSettings(
    stacks: WebAppStack<WebAppRuntimes & JavaContainers>[],
    i: number,
    j: number,
    k: number
  ): void {
    const windowsRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
    const linuxRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
    const windowsContainerSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsContainerSettings;
    const linuxContainerSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxContainerSettings;

    if (windowsRuntimeSettings && windowsRuntimeSettings.isPreview) {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
    }

    if (linuxRuntimeSettings && linuxRuntimeSettings.isPreview) {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
    }

    if (windowsContainerSettings && windowsContainerSettings.isPreview) {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsContainerSettings;
    }

    if (linuxContainerSettings && linuxContainerSettings.isPreview) {
      delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxContainerSettings;
    }
  }
}
