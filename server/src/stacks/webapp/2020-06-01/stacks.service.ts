import { Injectable } from '@nestjs/common';
import { WebAppStack, WebAppRuntimes, WebAppMajorVersion, JavaContainers, WebAppMinorVersion } from './stack.model';
import { dotnetCoreStack } from './stacks/dotnetCore';
import { javaStack } from './stacks/java';
import { aspDotnetStack } from './stacks/aspDotnet';
import { nodeStack } from './stacks/node';
import { rubyStack } from './stacks/ruby';
import { pythonStack } from './stacks/python';
import { phpStack } from './stacks/php';
import { javaContainersStack } from './stacks/javaContainers';
// tslint:disable: prefer-for-of

@Injectable()
export class WebAppStacksService20200601 {
  getStacks(os?: 'linux' | 'windows'): WebAppStack<WebAppRuntimes | JavaContainers>[] {
    const runtimeStacks = [aspDotnetStack, nodeStack, pythonStack, phpStack, dotnetCoreStack, rubyStack, javaStack];
    const containerStacks = [javaContainersStack];

    if (!os) {
      const allStacks: WebAppStack<WebAppRuntimes | JavaContainers>[] = [...runtimeStacks, ...containerStacks];
      return allStacks;
    }

    const filteredStacks: WebAppStack<WebAppRuntimes | JavaContainers>[] = [
      ...this._filterRuntimeStacks(runtimeStacks, os),
      ...this._filterContainerStacks(containerStacks, os),
    ];
    return filteredStacks;
  }

  private _filterRuntimeStacks(
    runtimeStacks: WebAppStack<WebAppRuntimes>[],
    os: 'linux' | 'windows'
  ): WebAppStack<WebAppRuntimes | JavaContainers>[] {
    const filteredStacks: WebAppStack<WebAppRuntimes | JavaContainers>[] = [];
    runtimeStacks.forEach(runtimeStack => {
      const newStack = this._buildNewStack(runtimeStack);
      runtimeStack.majorVersions.forEach(majorVersion => {
        const newMajorVersion = this._buildNewMajorVersion(majorVersion);
        majorVersion.minorVersions.forEach(minorVersion => {
          if (os === 'linux' && minorVersion.stackSettings.linuxRuntimeSettings !== undefined) {
            newMajorVersion.minorVersions.push(minorVersion);
          } else if (os === 'windows' && minorVersion.stackSettings.windowsRuntimeSettings !== undefined) {
            newMajorVersion.minorVersions.push(minorVersion);
          }
        });
        if (newMajorVersion.minorVersions.length > 0) {
          newStack.majorVersions.push(newMajorVersion);
        }
      });
      if (newStack.majorVersions.length > 0) {
        filteredStacks.push(newStack);
      }
    });
    return filteredStacks;
  }

  private _filterContainerStacks(
    runtimeStacks: WebAppStack<JavaContainers>[],
    os: 'linux' | 'windows'
  ): WebAppStack<WebAppRuntimes | JavaContainers>[] {
    const filteredStacks: WebAppStack<WebAppRuntimes | JavaContainers>[] = [];
    runtimeStacks.forEach(runtimeStack => {
      const newStack = this._buildNewStack(runtimeStack);
      runtimeStack.majorVersions.forEach(majorVersion => {
        const newMajorVersion = this._buildNewMajorVersion(majorVersion);
        majorVersion.minorVersions.forEach(minorVersion => {
          if (os === 'linux' && minorVersion.stackSettings.linuxContainerSettings !== undefined) {
            newMajorVersion.minorVersions.push(minorVersion);
          } else if (os === 'windows' && minorVersion.stackSettings.windowsContainerSettings !== undefined) {
            newMajorVersion.minorVersions.push(minorVersion);
          }
        });
        if (newMajorVersion.minorVersions.length > 0) {
          newStack.majorVersions.push(newMajorVersion);
        }
      });
      if (newStack.majorVersions.length > 0) {
        filteredStacks.push(newStack);
      }
    });
    return filteredStacks;
  }

  private _buildNewStack(stack: WebAppStack<WebAppRuntimes | JavaContainers>): WebAppStack<WebAppRuntimes | JavaContainers> {
    return {
      displayText: stack.displayText,
      value: stack.value,
      preferredOs: stack.preferredOs,
      sortOrder: 0,
      majorVersions: [],
    };
  }

  private _buildNewMajorVersion(
    majorVersion: WebAppMajorVersion<WebAppRuntimes | JavaContainers>
  ): WebAppMajorVersion<WebAppRuntimes | JavaContainers> {
    return {
      displayText: majorVersion.displayText,
      value: majorVersion.value,
      minorVersions: [],
    };
  }
}
