import i18next from 'i18next';
import { AvailableStackArray } from '../../../../../models/stacks/app-stacks';

interface VersionDetails {
  runtimeStackName: string;
  majorVersionName: string;
  majorVersionRuntime: string;
  minorVersionName: string;
  minorVersionRuntime: string;
}

export const getRuntimeStacks = (builtInStacks: AvailableStackArray) => {
  return (builtInStacks as any[])
    .filter(stack => stack.value !== 'javacontainers' && stack.value !== 'java')
    .map(stack => ({
      key: stack.value,
      text: stack.displayText,
    }));
};

export const getMajorVersions = (builtInStacks: AvailableStackArray, stack: string, t: i18next.TFunction) => {
  const stackToLower = (stack || '').toLowerCase();
  const currentStack = (builtInStacks as any[]).find(s => s.value === stackToLower);
  return !!currentStack
    ? currentStack.majorVersions.map(x => ({
        key: x.value,
        text: x.displayText,
      }))
    : [];
};

export const getMinorVersions = (builtInStacks: AvailableStackArray, stack: string, majorVersion: string, t: i18next.TFunction) => {
  const stackToLower = (stack || '').toLowerCase();
  const currentStack = (builtInStacks as any[]).find(s => s.value === stackToLower);
  if (!currentStack) {
    return [];
  }

  const majorVersionToLower = (majorVersion || '').toLowerCase();
  const currentVersion = currentStack.majorVersions.find(m => m.value === majorVersionToLower);
  if (!currentVersion) {
    return [];
  }

  return currentVersion.minorVersions.map(minVer => ({
    text: minVer.displayText,
    key:
      minVer.stackSettings.linuxRuntimeSettings && minVer.stackSettings.linuxRuntimeSettings.runtimeVersion
        ? minVer.stackSettings.linuxRuntimeSettings.runtimeVersion.toLocaleLowerCase()
        : minVer.value,
  }));
};

export const getVersionDetails = (builtInStacks: AvailableStackArray, version: string): VersionDetails => {
  let versionDetails = {
    runtimeStackName: '',
    majorVersionName: '',
    majorVersionRuntime: '',
    minorVersionName: '',
    minorVersionRuntime: '',
  };
  if (!!builtInStacks && !!version) {
    builtInStacks.forEach(stack => {
      stack.majorVersions.forEach(stackMajorVersion => {
        stackMajorVersion.minorVersions.forEach(stackMinorVersion => {
          const setting = stackMinorVersion.stackSettings.linuxRuntimeSettings;
          if (
            (setting && setting.runtimeVersion && setting.runtimeVersion.toLocaleLowerCase() === version) ||
            stackMinorVersion.value === version
          ) {
            versionDetails = {
              runtimeStackName: stack.value,
              majorVersionName: stackMajorVersion.value,
              majorVersionRuntime: stackMajorVersion.value,
              minorVersionName: stackMinorVersion.value,
              minorVersionRuntime: setting ? setting.runtimeVersion : stackMinorVersion.value,
            };
          }
        });
      });
    });
  }

  return versionDetails;
};

export const getSelectedRuntimeStack = (builtInStacks: AvailableStackArray, version: string) => {
  const versionDetails = getVersionDetails(builtInStacks, version);
  return versionDetails.runtimeStackName;
};

export const getSelectedMajorVersion = (builtInStacks: AvailableStackArray, version: string) => {
  const versionDetails = getVersionDetails(builtInStacks, version);
  return versionDetails.majorVersionRuntime;
};

export const getSelectedMinorVersion = (builtInStacks: AvailableStackArray, stack: string, version: string) => {
  const versionDetails = getVersionDetails(builtInStacks, version);
  return versionDetails.minorVersionRuntime;
};
