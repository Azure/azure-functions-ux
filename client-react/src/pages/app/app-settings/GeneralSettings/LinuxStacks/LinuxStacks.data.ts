import i18next from 'i18next';
import { WebAppStack } from '../../../../../models/stacks/web-app-stacks';
import { getMinorVersionText } from '../../../../../utils/stacks-utils';

export const LINUXJAVASTACKKEY = 'java';
export const LINUXJAVACONTAINERKEY = 'javacontainers';

interface VersionDetails {
  runtimeStackName: string;
  majorVersionName: string;
  majorVersionRuntime: string;
  minorVersionName: string;
  minorVersionRuntime: string;
}

export const getRuntimeStacks = (builtInStacks: WebAppStack[]) => {
  return builtInStacks
    .filter(stack => stack.value !== LINUXJAVACONTAINERKEY)
    .map(stack => ({
      key: stack.value,
      text: stack.displayText,
    }));
};

export const getMajorVersions = (builtInStacks: WebAppStack[], stack: string) => {
  const stackToLower = (stack || '').toLowerCase();
  const currentStack = builtInStacks.find(s => s.value === stackToLower);
  return (
    currentStack?.majorVersions.map(x => ({
      key: x.value,
      text: x.displayText,
    })) ?? []
  );
};

export const getMinorVersions = (builtInStacks: WebAppStack[], stack: string, majorVersion: string, t: i18next.TFunction) => {
  const stackToLower = (stack || '').toLowerCase();
  const currentStack = builtInStacks.find(s => s.value === stackToLower);
  if (!currentStack) {
    return [];
  }

  const majorVersionToLower = (majorVersion || '').toLowerCase();
  const currentVersion = currentStack.majorVersions.find(m => m.value === majorVersionToLower);
  if (!currentVersion) {
    return [];
  }

  return currentVersion.minorVersions.map(minVer => {
    const settings = minVer.stackSettings.linuxRuntimeSettings;

    return {
      text: getMinorVersionText(minVer.displayText, t, settings),
      key: settings && settings.runtimeVersion ? settings.runtimeVersion.toLocaleLowerCase() : minVer.value,
      data: settings,
    };
  });
};

export const getVersionDetails = (builtInStacks: WebAppStack[], version: string): VersionDetails => {
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
            (setting && setting.runtimeVersion && setting.runtimeVersion.toLowerCase() === version) ||
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

export const getSelectedRuntimeStack = (builtInStacks: WebAppStack[], version: string) => {
  const versionDetails = getVersionDetails(builtInStacks, version);
  return versionDetails.runtimeStackName;
};

export const getSelectedMajorVersion = (builtInStacks: WebAppStack[], version: string) => {
  const versionDetails = getVersionDetails(builtInStacks, version);
  return versionDetails.majorVersionRuntime;
};

export const getSelectedMinorVersion = (builtInStacks: WebAppStack[], stack: string, version: string) => {
  const versionDetails = getVersionDetails(builtInStacks, version);
  return versionDetails.minorVersionRuntime;
};

export const isJavaStackSelected = (builtInStacks: WebAppStack[], runtimeVersion: string): boolean => {
  let isJava = false;
  const javaContainers = builtInStacks.filter(stack => stack.value === 'javacontainers');
  javaContainers.forEach(stack => {
    stack.majorVersions.forEach(stackMajorVersion => {
      stackMajorVersion.minorVersions.forEach(stackMinorVersion => {
        const containerSettings = stackMinorVersion.stackSettings.linuxContainerSettings;
        if (
          containerSettings &&
          ((containerSettings.java17Runtime && containerSettings.java17Runtime.toLowerCase() === runtimeVersion) ||
            (containerSettings.java11Runtime && containerSettings.java11Runtime.toLowerCase() === runtimeVersion) ||
            (containerSettings.java8Runtime && containerSettings.java8Runtime.toLowerCase() === runtimeVersion))
        ) {
          isJava = true;
        }
      });
    });
  });
  return isJava;
};
