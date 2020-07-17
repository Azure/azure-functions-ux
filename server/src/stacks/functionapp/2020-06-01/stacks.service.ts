import { Injectable } from '@nestjs/common';
import { FunctionAppStack, FunctionAppMajorVersion, FunctionAppMinorVersion, Os, StackValue } from './stack.model';
import { dotnetCoreStack } from './stacks/dotnetCore';
import { nodeStack } from './stacks/node';
import { pythonStack } from './stacks/python';
import { javaStack } from './stacks/java';
import { powershellStack } from './stacks/powershell';
import { dotnetFrameworkStack } from './stacks/dotnetFramework';

@Injectable()
export class FunctionAppStacksService20200601 {
  getStacks(os?: Os, stackValue?: StackValue): FunctionAppStack[] {
    const functionAppStacks = [dotnetCoreStack, nodeStack, pythonStack, javaStack, powershellStack, dotnetFrameworkStack];

    if (!stackValue) {
      return !os ? functionAppStacks : this._filterFunctionAppStacksByOs(functionAppStacks, os);
    }

    const filteredStackByValue: FunctionAppStack[] = [functionAppStacks.find(stack => stack.value === stackValue)];
    return !os ? filteredStackByValue : this._filterFunctionAppStacksByOs(filteredStackByValue, os);
  }

  private _filterFunctionAppStacksByOs(stacks: FunctionAppStack[], os: Os): FunctionAppStack[] {
    const filteredStacks: FunctionAppStack[] = [];
    stacks.forEach(stack => {
      const newStack = this._buildNewStack(stack);
      stack.majorVersions.forEach(majorVersion => {
        const newMajorVersion = this._buildNewMajorVersion(majorVersion);
        majorVersion.minorVersions.forEach(minorVersion => {
          this._addCorrectMinorVersions(newMajorVersion, minorVersion, os);
        });
        this._addMajorVersion(newStack, newMajorVersion);
      });
      this._addStack(filteredStacks, newStack);
    });
    return filteredStacks;
  }

  private _buildNewStack(stack: FunctionAppStack): FunctionAppStack {
    return {
      displayText: stack.displayText,
      value: stack.value,
      preferredOs: stack.preferredOs,
      majorVersions: [],
    };
  }

  private _buildNewMajorVersion(majorVersion: FunctionAppMajorVersion): FunctionAppMajorVersion {
    return {
      displayText: majorVersion.displayText,
      value: majorVersion.value,
      minorVersions: [],
    };
  }

  private _addMajorVersion(newStack: FunctionAppStack, newMajorVersion: FunctionAppMajorVersion) {
    if (newMajorVersion.minorVersions.length > 0) {
      newStack.majorVersions.push(newMajorVersion);
    }
  }

  private _addStack(filteredStacks: FunctionAppStack[], newStack: FunctionAppStack) {
    if (newStack.majorVersions.length > 0) {
      filteredStacks.push(newStack);
    }
  }

  private _addCorrectMinorVersions(newMajorVersion: FunctionAppMajorVersion, minorVersion: FunctionAppMinorVersion, os: Os) {
    if (os === 'linux' && minorVersion.stackSettings.linuxRuntimeSettings) {
      this._addNewMinorVersionLinuxRuntime(newMajorVersion, minorVersion);
    } else if (os === 'windows' && minorVersion.stackSettings.windowsRuntimeSettings) {
      this._addNewMinorVersionWindowsRuntime(newMajorVersion, minorVersion);
    }
  }

  private _addNewMinorVersionLinuxRuntime(newMajorVersion: FunctionAppMajorVersion, minorVersion: FunctionAppMinorVersion) {
    const newMinorVersion: FunctionAppMinorVersion = {
      displayText: minorVersion.displayText,
      value: minorVersion.value,
      stackSettings: {
        linuxRuntimeSettings: minorVersion.stackSettings.linuxRuntimeSettings,
      },
    };
    newMajorVersion.minorVersions.push(newMinorVersion);
  }

  private _addNewMinorVersionWindowsRuntime(newMajorVersion: FunctionAppMajorVersion, minorVersion: FunctionAppMinorVersion) {
    const newMinorVersion: FunctionAppMinorVersion = {
      displayText: minorVersion.displayText,
      value: minorVersion.value,
      stackSettings: {
        windowsRuntimeSettings: minorVersion.stackSettings.windowsRuntimeSettings,
      },
    };
    newMajorVersion.minorVersions.push(newMinorVersion);
  }
}
