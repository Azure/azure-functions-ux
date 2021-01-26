import { AppStackOs, AppStackMinorVersion, AppStackMajorVersion } from '../models/AppStackModel';
import { FunctionAppStack, FunctionAppRuntimes } from '../models/FunctionAppStackModel';
import { ArrayUtil } from '../../../utilities/array.util';

export function filterFunctionAppStacks(
  stacks: FunctionAppStack[],
  os?: AppStackOs,
  removeHiddenStacks?: boolean,
  removeDeprecatedStacks?: boolean,
  removePreviewStacks?: boolean,
  removeGitHubActionUnsupportedStacks?: boolean
): FunctionAppStack[] {
  stacks.forEach((stack, i) => {
    stack.majorVersions.forEach((majorVersion, j) => {
      majorVersion.minorVersions.forEach((minorVersion, k) => {
        // Remove runtime settings if they do not meet filters
        if (os) {
          _removeUnsupportedOsRuntimeSettings(stacks, i, j, k, os);
        }
        if (removeHiddenStacks) {
          _removeHiddenRuntimeSettings(stacks, i, j, k);
        }
        if (removeDeprecatedStacks) {
          _removeDeprecatedRuntimeSettings(stacks, i, j, k);
        }
        if (removePreviewStacks) {
          _removePreviewRuntimeSettings(stacks, i, j, k);
        }
        if (removeGitHubActionUnsupportedStacks) {
          _removeGitHubActionUnsupportedRuntime(stacks, i, j, k);
        }
      });

      // Remove Minor Versions without Runtime Settings
      ArrayUtil.remove<AppStackMinorVersion<FunctionAppRuntimes>>(majorVersion.minorVersions, minorVersion => {
        return !minorVersion.stackSettings.windowsRuntimeSettings && !minorVersion.stackSettings.linuxRuntimeSettings;
      });
    });

    // Remove Major Versions without Minor Versions
    ArrayUtil.remove<AppStackMajorVersion<FunctionAppRuntimes>>(stack.majorVersions, majorVersion => {
      return majorVersion.minorVersions.length === 0;
    });
  });

  // Remove Stacks without Major Versions
  ArrayUtil.remove<FunctionAppStack>(stacks, stack => stack.majorVersions.length === 0);
  return stacks;
}

function _removeUnsupportedOsRuntimeSettings(stacks: FunctionAppStack[], i: number, j: number, k: number, os: AppStackOs): void {
  if (os === 'linux') {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
  } else if (os === 'windows') {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
  }
}

function _removeHiddenRuntimeSettings(stacks: FunctionAppStack[], i: number, j: number, k: number): void {
  const windowsRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
  const linuxRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;

  if (windowsRuntimeSettings && windowsRuntimeSettings.isHidden) {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
  }

  if (linuxRuntimeSettings && linuxRuntimeSettings.isHidden) {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
  }
}

function _removeDeprecatedRuntimeSettings(stacks: FunctionAppStack[], i: number, j: number, k: number): void {
  const windowsRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
  const linuxRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;

  if (windowsRuntimeSettings && windowsRuntimeSettings.isDeprecated) {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
  }

  if (linuxRuntimeSettings && linuxRuntimeSettings.isDeprecated) {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
  }
}

function _removePreviewRuntimeSettings(stacks: FunctionAppStack[], i: number, j: number, k: number): void {
  const windowsRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
  const linuxRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;

  if (windowsRuntimeSettings && windowsRuntimeSettings.isPreview) {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
  }

  if (linuxRuntimeSettings && linuxRuntimeSettings.isPreview) {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
  }
}

function _removeGitHubActionUnsupportedRuntime(stacks: FunctionAppStack[], i: number, j: number, k: number): void {
  const windowsRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
  const linuxRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;

  if (windowsRuntimeSettings && !windowsRuntimeSettings.gitHubActionSettings.isSupported) {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
  }

  if (linuxRuntimeSettings && !linuxRuntimeSettings.gitHubActionSettings.isSupported) {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
  }
}
