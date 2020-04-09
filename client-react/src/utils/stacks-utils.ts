import { ArmObj } from '../models/arm-obj';
import { AvailableStack, MinorVersion, Framework, MajorVersion, MinorVersion2 } from '../models/available-stacks';

const isStackVersionEndOfLife = (stackName: string, runtimeVersion: string) => {
  if (!stackName || !runtimeVersion) {
    return false;
  }

  if (stackName === 'dotnetcore') {
    return (
      runtimeVersion === '1.0' ||
      runtimeVersion.startsWith('1.0.') ||
      runtimeVersion === '1.1' ||
      runtimeVersion.startsWith('1.1.') ||
      runtimeVersion === '2.0' ||
      runtimeVersion.startsWith('2.0.') ||
      runtimeVersion === '2.2' ||
      runtimeVersion.startsWith('2.2.') ||
      runtimeVersion === '3.0' ||
      runtimeVersion.startsWith('3.0.')
    );
  }

  if (stackName === 'node') {
    // Any version below 10.x is EOL
    const runtimeVersionDotSplit = runtimeVersion.split('.');
    const runtimeVersionMajor = parseInt(runtimeVersionDotSplit[0], 10);
    return !!runtimeVersionMajor && runtimeVersionMajor < 10;
  }

  if (stackName === 'php') {
    return (
      runtimeVersion === '5.6' ||
      runtimeVersion.startsWith('5.6.') ||
      runtimeVersion === '7.0' ||
      runtimeVersion.startsWith('7.0.') ||
      runtimeVersion === '7.1' ||
      runtimeVersion.startsWith('7.1.')
    );
  }

  if (stackName === 'python') {
    return runtimeVersion === '2.7' || runtimeVersion.startsWith('2.7.');
  }

  if (stackName === 'java8') {
    return runtimeVersion.toLowerCase().startsWith('wildfly|');
  }

  if (stackName === 'ruby') {
    return runtimeVersion === '2.3' || runtimeVersion.startsWith('2.3.') || runtimeVersion === '2.4' || runtimeVersion.startsWith('2.4.');
  }

  return false;
};

const extractRuntimeVersion = (runtimeVersion: string, stackName: string, isLinux?: boolean): string => {
  let version = runtimeVersion || '';

  if (isLinux && stackName === 'java8') {
    return runtimeVersion;
  }

  if (isLinux) {
    const runtimeVersionSplitOnPipe = runtimeVersion.split('|');
    version = runtimeVersionSplitOnPipe.length === 2 ? runtimeVersionSplitOnPipe[1] : '';
  }

  // version might look like '8-lts', so we only take the portion before the '-'
  const versionSplitOnDash = version.split('-');

  return versionSplitOnDash[0];
};

export const markEndOfLifeStacksInPlace = (stacks: ArmObj<AvailableStack>[]) => {
  stacks.forEach(stack => {
    const isLinux = !!stack.type && stack.type.toLowerCase() === 'Microsoft.Web/availableStacks?osTypeSelected=Linux'.toLowerCase();
    const stackName = (stack.name || '').toLowerCase();

    if (
      stackName === 'dotnetcore' ||
      stackName === 'node' ||
      stackName === 'php' ||
      stackName === 'python' ||
      stackName === 'java8' ||
      stackName === 'ruby'
    ) {
      const majorVersions = stack.properties.majorVersions || [];
      majorVersions.forEach(majorVersion => {
        let allMinorVersionsEndOfLife = true;
        const minorVersions = majorVersion.minorVersions || [];
        minorVersions.forEach(minorVersion => {
          const minorVersionRuntime = extractRuntimeVersion(minorVersion.runtimeVersion, stackName, isLinux);
          minorVersion.isEndOfLife = isStackVersionEndOfLife(stackName, minorVersionRuntime);
          allMinorVersionsEndOfLife = allMinorVersionsEndOfLife && minorVersion.isEndOfLife;
        });

        const majorVersionRuntime = extractRuntimeVersion(majorVersion.runtimeVersion, stackName, isLinux);
        majorVersion.isEndOfLife = isStackVersionEndOfLife(stackName, majorVersionRuntime);
        majorVersion.allMinorVersionsEndOfLife = allMinorVersionsEndOfLife;
      });
    }
  });
};

export const purgeJavaStacksForWindowsInPlace = (
  stacks: ArmObj<AvailableStack>[],
  javaVersion: string,
  javaContainer: string,
  javaContainerVersion: string
) => {
  _purgeWindowsJavaVersionsInPlace(stacks, javaVersion);
  _purgeWindowsJavaContainersInPlace(stacks, javaContainer, javaContainerVersion);
};

const _purgeWindowsJavaVersionsInPlace = (stacks: ArmObj<AvailableStack>[], configuredVersion: string) => {
  const javaStacks = stacks.find(stack => {
    const isWindows = !!stack.type && stack.type.toLowerCase() === 'Microsoft.Web/availableStacks?osTypeSelected=Windows'.toLowerCase();
    const isJava = (stack.name || '').toLowerCase() === 'java';
    return isWindows && isJava;
  });

  const isConfiguredVersion = (version: MajorVersion | MinorVersion) => version.runtimeVersion === configuredVersion;

  const isVersion8ZuluWithJFR = (version: MinorVersion) => {
    const runtimeVersion = (version.runtimeVersion || '').toLocaleLowerCase();
    return version.isAutoUpdate || (runtimeVersion.indexOf('_zulu') !== -1 && runtimeVersion >= '1.8.0_202_zulu');
  };

  const majorVersions = (javaStacks && javaStacks.properties.majorVersions) || [];

  for (let index = majorVersions.length - 1; index >= 0; index = index - 1) {
    const majorVersion = majorVersions[index];

    switch (majorVersion.runtimeVersion) {
      case '1.7':
        // Purge all minor versions (except for currently configured vesrion if applicable).
        majorVersion.minorVersions = (majorVersion.minorVersions || []).filter(minorVersion => isConfiguredVersion(minorVersion));
        break;
      case '1.8':
        // Purge all non-ZULU minor versions older than 1.8.0_202_ZULU (except for currently configured vesrion if applicable).
        majorVersion.minorVersions = (majorVersion.minorVersions || []).filter(
          minorVersion => isConfiguredVersion(minorVersion) || isVersion8ZuluWithJFR(minorVersion)
        );
        break;
    }

    if (majorVersion.minorVersions.length > 0) {
      // Clear the 'isDefault' property on all minor versions.
      majorVersion.isDefault = false;
      majorVersion.minorVersions.forEach(minorVersion => (minorVersion.isDefault = false));
    } else if (!isConfiguredVersion(majorVersion)) {
      // We've purged all the minor versions, and the configured value doesn't equal the major version either, so purge the major version entirely.
      majorVersions.splice(index, 1);
    }
  }
};

const _purgeWindowsJavaContainersInPlace = (
  stacks: ArmObj<AvailableStack>[],
  configuredContainer: string,
  configuredContainerVersion: string
) => {
  const javaContainers = stacks.find(stack => {
    const isWindows = !!stack.type && stack.type.toLowerCase() === 'Microsoft.Web/availableStacks?osTypeSelected=Windows'.toLowerCase();
    const isJavaContainers = (stack.name || '').toLowerCase() === 'javacontainers';
    return isWindows && isJavaContainers;
  });

  const frameworks = (javaContainers && javaContainers.properties.frameworks) || [];

  for (let index = frameworks.length - 1; index >= 0; index = index - 1) {
    const framework = frameworks[index];
    const frameworkName = (framework.name || '').toLocaleLowerCase();

    switch (frameworkName) {
      case 'jetty':
        // Purge all versions (except for currently configured vesrion if applicable).
        _purgeWindowsJavaJettyInPlace(framework, configuredContainer, configuredContainerVersion);
        break;
      case 'tomcat':
        // Purge all but the N newest minor versions for each major version (except for currently configured vesrion if applicable).
        _purgeWindowsJavaTomcatInPlace(framework, configuredContainer, configuredContainerVersion);
        break;
    }

    if (framework.majorVersions.length === 0) {
      // We've purged all the major versions, so completely purge the framework.
      frameworks.splice(index, 1);
    } else {
      // Clear the 'isDefault' property on all major versions.
      framework.majorVersions.forEach(majorVersion => (majorVersion.isDefault = false));
    }
  }
};

const _purgeWindowsJavaJettyInPlace = (framework: Framework, configuredContainer: string, configuredContainerVersion: string) => {
  const isConfiguredCointainerVersion = (version: MajorVersion | MinorVersion2) => version.runtimeVersion === configuredContainerVersion;

  if ((configuredContainer || '').toLocaleLowerCase() !== 'jetty') {
    // The configured container isn't Jetty, so purge all versions.
    framework.majorVersions = [];
  } else {
    const majorVersions = framework.majorVersions || [];
    for (let index = majorVersions.length - 1; index >= 0; index = index - 1) {
      const majorVersion = majorVersions[index];
      // Purge all minor versions (except for currently configured vesrion if applicable).
      majorVersion.minorVersions = (majorVersion.minorVersions || []).filter(minorVersion => isConfiguredCointainerVersion(minorVersion));

      if (majorVersion.minorVersions.length > 0) {
        // Clear the 'isDefault' property on all minor versions.
        majorVersion.isDefault = false;
        majorVersion.minorVersions.forEach(minorVersion => (minorVersion.isDefault = false));
      } else if (!isConfiguredCointainerVersion(majorVersion)) {
        // We've purged all the minor versions, and the configured value doesn't equal the major version either, so purge the major version entirely.
        majorVersions.splice(index, 1);
      }
    }
  }
};

const _purgeWindowsJavaTomcatInPlace = (framework: Framework, configuredContainer: string, configuredContainerVersion: string) => {
  const isConfiguredCointainerVersion = (version: MajorVersion | MinorVersion2) => version.runtimeVersion === configuredContainerVersion;

  // For major version 7, purge all minor versions.
  // For major versions 8 and 9, retain at most three minor versions.
  const maxVersionsToRetain = { '7': 0, '8': 3, '9': 3 };
  const numVersionsRetained = { '7': 0, '8': 0, '9': 0 };

  // For major versions 8 and 9, also retain the auto-update version.
  const retainAutoUpdate = { '7': false, '8': true, '9': true };
  const autoUpdateRetained = { '7': false, '8': false, '9': false };

  const majorVersions = framework.majorVersions || [];
  for (let majorIndex = majorVersions.length - 1; majorIndex >= 0; majorIndex = majorIndex - 1) {
    const majorVersion = majorVersions[majorIndex];
    const runtimeVersion = majorVersion.runtimeVersion || '';

    if (runtimeVersion.startsWith('7.') || runtimeVersion.startsWith('8.') || runtimeVersion.startsWith('9.')) {
      const versionKey = runtimeVersion.substr(0, 1);
      const minorVersions = majorVersion.minorVersions || [];
      const minorVersionsPurged: MinorVersion2[] = [];

      // Purge all but he last N minor versions (except for currently configured vesrion if applicable).
      for (let minorIndex = minorVersions.length - 1; minorIndex >= 0; minorIndex = minorIndex - 1) {
        const minorVersion = minorVersions[minorIndex];
        if (minorVersion.isAutoUpdate && retainAutoUpdate[versionKey] && !autoUpdateRetained[versionKey]) {
          // This is the auto-update version, and we want to retain the auto-update version for this major version.
          // Add this to the list and increment the counter. Also set the autoUpdateRetained flag.
          minorVersionsPurged.unshift(minorVersion);
          numVersionsRetained[versionKey] = numVersionsRetained[versionKey] + 1;
          autoUpdateRetained[versionKey] = true;
        } else if (numVersionsRetained[versionKey] < maxVersionsToRetain[versionKey]) {
          // We've retained fewer than N minor versions, so add this to the list and increment the counter.
          minorVersionsPurged.unshift(minorVersion);
          numVersionsRetained[versionKey] = numVersionsRetained[versionKey] + 1;
        } else if (isConfiguredCointainerVersion(minorVersion)) {
          // This is the configured version, so add it to the list but don't increment the counter.
          minorVersionsPurged.unshift(minorVersion);
        }
      }

      majorVersion.minorVersions = minorVersionsPurged;
    }

    if (majorVersion.minorVersions.length > 0) {
      // Clear the 'isDefault' property on all minor versions.
      majorVersion.isDefault = false;
      majorVersion.minorVersions.forEach(minorVersion => (minorVersion.isDefault = false));
    } else if (!isConfiguredCointainerVersion(majorVersion)) {
      // We've purged all the minor versions, and the configured value doesn't equal the major version either, so purge the major version entirely.
      majorVersions.splice(majorIndex, 1);
    }
  }
};
