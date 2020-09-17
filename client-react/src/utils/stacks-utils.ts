import { WebAppStack } from '../models/stacks/web-app-stacks';
import { IDropdownOption } from 'office-ui-fabric-react';
import { AppStackOs } from '../models/stacks/app-stacks';
import { FunctionAppStack } from '../models/stacks/function-app-stacks';

export const getStacksSummaryForDropdown = (stack: WebAppStack | FunctionAppStack, osType: AppStackOs): IDropdownOption[] => {
  const options: IDropdownOption[] = [];
  stack.majorVersions.forEach(stackMajorVersion => {
    stackMajorVersion.minorVersions.forEach(stackMinorVersion => {
      const settings =
        osType === AppStackOs.linux
          ? stackMinorVersion.stackSettings.linuxRuntimeSettings
          : stackMinorVersion.stackSettings.windowsRuntimeSettings;
      if (settings) {
        options.push({
          key: settings.runtimeVersion,
          text: stackMinorVersion.displayText,
          data: stackMinorVersion,
        });
      }
    });
  });
  return options;
};

export const JavaVersions = {
  WindowsVersion8: '1.8',
  WindowsVersion11: '11',
  LinuxVersion8: 'jre8',
  LinuxVersion11: 'java11',
};

export const JavaContainers = {
  JavaSE: 'java',
  Tomcat: 'tomcat',
};

export const RuntimeStacks = {
  aspnet: 'asp.net',
  node: 'node',
  python: 'python',
  dotnetcore: 'dotnetcore',
  java8: 'java-8',
  java11: 'java-11',
};
