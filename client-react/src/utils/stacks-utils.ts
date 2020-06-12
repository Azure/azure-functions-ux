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

export class JavaVersions {
  public static WindowsVersion8 = '1.8';
  public static WindowsVersion11 = '11';
  public static LinuxVersion8 = 'java8';
  public static LinuxVersion11 = 'java11';
}

export class JavaContainers {
  public static JavaSE = 'java';
  public static Tomcat = 'tomcat';
}

export class RuntimeStacks {
  public static aspnet = 'dotnet';
  public static node = 'node';
  public static python = 'python';
  public static dotnetcore = 'dotnetcore';
  public static java8 = 'java-8';
  public static java11 = 'java-11';
}
