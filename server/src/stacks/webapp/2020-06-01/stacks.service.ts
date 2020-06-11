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
    stacks: WebAppStack<WebAppRuntimes>[],
    os: 'linux' | 'windows'
  ): WebAppStack<WebAppRuntimes | JavaContainers>[] {
    const filteredStacks: WebAppStack<WebAppRuntimes | JavaContainers>[] = [];
    stacks.forEach(stack => {
      const newStack = this._buildNewStack(stack);
      stack.majorVersions.forEach(majorVersion => {
        const newMajorVersion = this._buildNewMajorVersion(majorVersion);
        majorVersion.minorVersions.forEach(minorVersion => {
          this._addCorrectMinorVersionsForRuntime(newMajorVersion, minorVersion, os);
        });
        this._addMajorVersion(newStack, newMajorVersion);
      });
      this._addStack(filteredStacks, newStack);
    });
    return filteredStacks;
  }

  private _filterContainerStacks(
    stacks: WebAppStack<JavaContainers>[],
    os: 'linux' | 'windows'
  ): WebAppStack<WebAppRuntimes | JavaContainers>[] {
    const filteredStacks: WebAppStack<WebAppRuntimes | JavaContainers>[] = [];
    stacks.forEach(runtimeStack => {
      const newStack = this._buildNewStack(runtimeStack);
      runtimeStack.majorVersions.forEach(majorVersion => {
        const newMajorVersion = this._buildNewMajorVersion(majorVersion);
        majorVersion.minorVersions.forEach(minorVersion => {
          this._addCorrectMinorVersionsForContainer(newMajorVersion, minorVersion, os);
        });
        this._addMajorVersion(newStack, newMajorVersion);
      });
      this._addStack(filteredStacks, newStack);
    });
    return filteredStacks;
  }

  private _buildNewStack(stack: WebAppStack<WebAppRuntimes | JavaContainers>): WebAppStack<WebAppRuntimes | JavaContainers> {
    return {
      displayText: stack.displayText,
      value: stack.value,
      preferredOs: stack.preferredOs,
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

  private _addMajorVersion(
    newStack: WebAppStack<WebAppRuntimes | JavaContainers>,
    newMajorVersion: WebAppMajorVersion<WebAppRuntimes | JavaContainers>
  ) {
    if (newMajorVersion.minorVersions.length > 0) {
      newStack.majorVersions.push(newMajorVersion);
    }
  }

  private _addStack(
    filteredStacks: WebAppStack<WebAppRuntimes | JavaContainers>[],
    newStack: WebAppStack<WebAppRuntimes | JavaContainers>
  ) {
    if (newStack.majorVersions.length > 0) {
      filteredStacks.push(newStack);
    }
  }

  private _addCorrectMinorVersionsForRuntime(
    newMajorVersion: WebAppMajorVersion<WebAppRuntimes | JavaContainers>,
    minorVersion: WebAppMinorVersion<WebAppRuntimes>,
    os: 'linux' | 'windows'
  ) {
    if (os === 'linux' && minorVersion.stackSettings.linuxRuntimeSettings !== undefined) {
      this._addNewMinorVersionLinuxRuntime(newMajorVersion, minorVersion);
    } else if (os === 'windows' && minorVersion.stackSettings.windowsRuntimeSettings !== undefined) {
      this._addNewMinorVersionWindowsRuntime(newMajorVersion, minorVersion);
    }
  }

  private _addNewMinorVersionLinuxRuntime(
    newMajorVersion: WebAppMajorVersion<WebAppRuntimes | JavaContainers>,
    minorVersion: WebAppMinorVersion<WebAppRuntimes>
  ) {
    const newMinorVersion: WebAppMinorVersion<WebAppRuntimes> = {
      displayText: minorVersion.displayText,
      value: minorVersion.value,
      stackSettings: {
        linuxRuntimeSettings: minorVersion.stackSettings.linuxRuntimeSettings,
      },
    };
    newMajorVersion.minorVersions.push(newMinorVersion);
  }

  private _addNewMinorVersionWindowsRuntime(
    newMajorVersion: WebAppMajorVersion<WebAppRuntimes | JavaContainers>,
    minorVersion: WebAppMinorVersion<WebAppRuntimes>
  ) {
    const newMinorVersion: WebAppMinorVersion<WebAppRuntimes> = {
      displayText: minorVersion.displayText,
      value: minorVersion.value,
      stackSettings: {
        windowsRuntimeSettings: minorVersion.stackSettings.windowsRuntimeSettings,
      },
    };
    newMajorVersion.minorVersions.push(newMinorVersion);
  }

  private _addCorrectMinorVersionsForContainer(
    newMajorVersion: WebAppMajorVersion<WebAppRuntimes | JavaContainers>,
    minorVersion: WebAppMinorVersion<JavaContainers>,
    os: 'linux' | 'windows'
  ) {
    if (os === 'linux' && minorVersion.stackSettings.linuxContainerSettings !== undefined) {
      this._addNewMinorVersionLinuxContainer(newMajorVersion, minorVersion);
    } else if (os === 'windows' && minorVersion.stackSettings.windowsContainerSettings !== undefined) {
      this._addNewMinorVersionWindowsContainer(newMajorVersion, minorVersion);
    }
  }

  private _addNewMinorVersionLinuxContainer(
    newMajorVersion: WebAppMajorVersion<WebAppRuntimes | JavaContainers>,
    minorVersion: WebAppMinorVersion<JavaContainers>
  ) {
    const newMinorVersion: WebAppMinorVersion<JavaContainers> = {
      displayText: minorVersion.displayText,
      value: minorVersion.value,
      stackSettings: {
        linuxContainerSettings: minorVersion.stackSettings.linuxContainerSettings,
      },
    };
    newMajorVersion.minorVersions.push(newMinorVersion);
  }

  private _addNewMinorVersionWindowsContainer(
    newMajorVersion: WebAppMajorVersion<WebAppRuntimes | JavaContainers>,
    minorVersion: WebAppMinorVersion<JavaContainers>
  ) {
    const newMinorVersion: WebAppMinorVersion<JavaContainers> = {
      displayText: minorVersion.displayText,
      value: minorVersion.value,
      stackSettings: {
        windowsContainerSettings: minorVersion.stackSettings.windowsContainerSettings,
      },
    };
    newMajorVersion.minorVersions.push(newMinorVersion);
  }
}
