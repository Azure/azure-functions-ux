import { AvailableStack } from '../../../../../models/available-stacks';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { ArmObj } from '../../../../../models/arm-obj';
import { SiteConfig } from '../../../../../models/site/config';

export const getJavaStack = (stacks: ArmObj<AvailableStack>[]) => stacks.find(x => x.name === 'java');
export const getJavaContainers = (stacks: ArmObj<AvailableStack>[]) => stacks.find(x => x.name === 'javaContainers');

export const getJavaMajorVersion = (javaStack: AvailableStack, config: ArmObj<SiteConfig>) => {
  const { javaVersion } = config.properties;
  const javaMajorVersion = javaStack.majorVersions.find(
    x => x.runtimeVersion === javaVersion || !!x.minorVersions.find(y => y.runtimeVersion === javaVersion)
  );
  if (javaMajorVersion) {
    return javaMajorVersion.runtimeVersion;
  }
  const defaultVersion = javaStack.majorVersions.find(x => x.isDefault);
  return defaultVersion ? defaultVersion.runtimeVersion : '1.8';
};

export const getJavaVersionAsDropdownOptions = (javaStack: ArmObj<AvailableStack>) =>
  javaStack.properties.majorVersions.map<IDropdownOption>(val => {
    return {
      key: val.runtimeVersion,
      // The value of val.runtimeVersion may be '1.7', '1.8' or '11'.
      // We want to display 'Java 7', 'Java 8', or 'Java 11' respectively.
      text: `Java ${val.runtimeVersion.split('.')[1] || val.runtimeVersion}`,
    };
  });

export const getJavaMajorVersionObject = (javaStack: ArmObj<AvailableStack>, currentJavaMajorVersion: string) =>
  javaStack.properties.majorVersions.find(x => x.runtimeVersion === currentJavaMajorVersion);

export const getJavaMinorVersionOptions = (
  currentJavaMajorVersion: string,
  javaStack: ArmObj<AvailableStack>,
  newestLabel: string,
  autoUpdateLabel: string
) => {
  const currentJavaMajorVersionOnject = getJavaMajorVersionObject(javaStack, currentJavaMajorVersion);
  let javaMinorVersionOptions: IDropdownOption[] = [];
  if (currentJavaMajorVersionOnject) {
    const version = [
      {
        key: currentJavaMajorVersionOnject.runtimeVersion,
        text: `${currentJavaMajorVersionOnject.displayVersion} (${autoUpdateLabel})`,
      },
    ];
    javaMinorVersionOptions = version.concat(
      currentJavaMajorVersionOnject.minorVersions.map(val => {
        const newest = val.isDefault ? ` (${newestLabel})` : '';
        return {
          key: val.runtimeVersion,
          text: `${val.displayVersion}${newest}`,
        };
      })
    );
  }
  return javaMinorVersionOptions;
};

export const getJavaContainersOptions = (javaContainers: ArmObj<AvailableStack>) =>
  javaContainers.properties.frameworks.map<IDropdownOption>(val => {
    return {
      key: val.name.toUpperCase(),
      text: val.display,
    };
  });

export const getFrameworkVersionOptions = (javaContainers: ArmObj<AvailableStack>, config: ArmObj<SiteConfig>, autoUpdateLabel: string) => {
  const currentFramework =
    config.properties.javaContainer &&
    javaContainers.properties.frameworks.find(x => x.name.toLowerCase() === config.properties.javaContainer.toLowerCase());
  let javaFrameworkVersionOptions: IDropdownOption[] = [];
  if (currentFramework) {
    const majorVersions = currentFramework.majorVersions.map(val => {
      const version = [
        {
          key: val.runtimeVersion,
          text: `${val.displayVersion} (${autoUpdateLabel})`,
        },
      ];
      return version.concat(
        val.minorVersions.map(inner => {
          return {
            key: inner.runtimeVersion,
            text: inner.displayVersion,
          };
        })
      );
    });
    majorVersions.forEach(x => {
      javaFrameworkVersionOptions = javaFrameworkVersionOptions.concat(x);
    });
  }
  return javaFrameworkVersionOptions;
};
