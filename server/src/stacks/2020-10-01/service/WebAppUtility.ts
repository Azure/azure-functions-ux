import { WebAppStack, WebAppRuntimes, JavaContainers } from '../models/WebAppStackModel';
import { AppStackMinorVersion, AppStackMajorVersion, AppStackOs } from '../models/AppStackModel';
import { ArrayUtil } from '../../../utilities/array.util';

export function filterWebAppStacks(
  stacks: WebAppStack[],
  os?: AppStackOs,
  removeHiddenStacks?: boolean,
  removeDeprecatedStacks?: boolean,
  removePreviewStacks?: boolean,
  removeNonGitHubActionStacks?: boolean
): WebAppStack[] {
  stacks.forEach((stack, i) => {
    stack.majorVersions.forEach((majorVersion, j) => {
      majorVersion.minorVersions.forEach((minorVersion, k) => {
        // Remove runtime settings and container settings if they do not meet filters
        if (os) {
          _removeUnsupportedOsRuntimeAndContainerSettings(stacks, i, j, k, os);
        }
        if (removeHiddenStacks) {
          _removeHiddenRuntimeAndContainerSettings(stacks, i, j, k);
        }
        if (removeDeprecatedStacks) {
          _removeDeprecatedRuntimeAndContainerSettings(stacks, i, j, k);
        }
        if (removePreviewStacks) {
          _removePreviewRuntimeAndContainerSettings(stacks, i, j, k);
        }
        if (removeNonGitHubActionStacks) {
          _removeNonGitHubActionRuntimeSettings(stacks, i, j, k);
        }
      });

      // Remove Minor Versions without Runtime Settings and Container Settings
      ArrayUtil.remove<AppStackMinorVersion<WebAppRuntimes & JavaContainers>>(majorVersion.minorVersions, minorVersion => {
        return (
          !minorVersion.stackSettings.windowsRuntimeSettings &&
          !minorVersion.stackSettings.linuxRuntimeSettings &&
          !minorVersion.stackSettings.windowsContainerSettings &&
          !minorVersion.stackSettings.linuxContainerSettings
        );
      });
    });

    // Remove Major Versions without Minor Versions
    ArrayUtil.remove<AppStackMajorVersion<WebAppRuntimes & JavaContainers>>(stack.majorVersions, majorVersion => {
      return majorVersion.minorVersions.length === 0;
    });
  });

  // Remove Stacks without Major Versions
  ArrayUtil.remove<WebAppStack>(stacks, stack => stack.majorVersions.length === 0);
  return stacks;
}

function _removeUnsupportedOsRuntimeAndContainerSettings(stacks: WebAppStack[], i: number, j: number, k: number, os: AppStackOs): void {
  if (os === 'linux') {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsContainerSettings;
  } else if (os === 'windows') {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxContainerSettings;
  }
}

function _removeHiddenRuntimeAndContainerSettings(stacks: WebAppStack[], i: number, j: number, k: number): void {
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

function _removeDeprecatedRuntimeAndContainerSettings(stacks: WebAppStack[], i: number, j: number, k: number): void {
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

function _removePreviewRuntimeAndContainerSettings(stacks: WebAppStack[], i: number, j: number, k: number): void {
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

function _removeNonGitHubActionRuntimeSettings(stacks: WebAppStack[], i: number, j: number, k: number): void {
  const windowsRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
  const linuxRuntimeSettings = stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;

  if (windowsRuntimeSettings && !windowsRuntimeSettings.gitHubActionSettings.isSupported) {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsRuntimeSettings;
  }

  if (linuxRuntimeSettings && !linuxRuntimeSettings.gitHubActionSettings.isSupported) {
    delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxRuntimeSettings;
  }

  // NOTE(michinoy): As of now the container settings do not need to be returned as they do not contain any github action support
  delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.windowsContainerSettings;
  delete stacks[i].majorVersions[j].minorVersions[k].stackSettings.linuxContainerSettings;
}
