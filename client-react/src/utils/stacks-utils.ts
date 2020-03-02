import { ArmObj } from '../models/arm-obj';
import { AvailableStack } from '../models/available-stacks';

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
      runtimeVersion.startsWith('2.2.')
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
    return runtimeVersion === '2.3' || runtimeVersion.startsWith('2.3.');
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
