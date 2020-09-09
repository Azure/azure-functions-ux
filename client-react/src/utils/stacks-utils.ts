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

export class JavaVersions {
  public static WindowsVersion8 = '1.8';
  public static WindowsVersion11 = '11';
  public static LinuxVersion8 = 'jre8';
  public static LinuxVersion11 = 'java11';
}

export class JavaContainers {
  public static JavaSE = 'java';
  public static Tomcat = 'tomcat';
}

export class RuntimeStacks {
  public static aspnet = 'asp.net';
  public static node = 'node';
  public static python = 'python';
  public static dotnetcore = 'dotnetcore';
  public static java8 = 'java-8';
  public static java11 = 'java-11';
}
