import { WebAppStack, WebAppRuntimeSettings } from '../models/stacks/web-app-stacks';
import { IDropdownOption } from 'office-ui-fabric-react';
import { AppStackOs } from '../models/stacks/app-stacks';
import { FunctionAppStack } from '../models/stacks/function-app-stacks';
import i18next from 'i18next';
import LogService from './LogService';
import { LogCategories } from './LogCategories';
import { getDateAfterXSeconds } from './DateUtilities';

export const ENDOFLIFEMAXSECONDS = 5184000; // 60 days

export const getStacksSummaryForDropdown = (
  stack: WebAppStack | FunctionAppStack,
  osType: AppStackOs,
  t: i18next.TFunction
): IDropdownOption[] => {
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
          text: getMinorVersionText(stackMinorVersion.displayText, t, settings),
          data: stackMinorVersion,
        });
      }
    });
  });
  return options;
};

export const getMinorVersionText = (text: string, t: i18next.TFunction, settings?: WebAppRuntimeSettings) => {
  if (!!settings) {
    if (settings.isAutoUpdate) {
      return t('stackVersionAutoUpdate').format(text);
    }
    if (isStackVersionEndOfLife(settings.endOfLifeDate)) {
      return t('endOfLifeTagTemplate').format(text);
    }
    if (settings.isDeprecated) {
      return t('stackVersionDeprecated').format(text);
    }
    if (settings.isPreview) {
      return t('stackVersionPreview').format(text);
    }
  }
  return text;
};

export const isStackVersionEndOfLife = (endOfLifeDate?: string): boolean => {
  try {
    return !!endOfLifeDate && Date.parse(endOfLifeDate) <= getDateAfterXSeconds(ENDOFLIFEMAXSECONDS).getSeconds();
  } catch (err) {
    LogService.error(LogCategories.appSettings, 'StackSettings', err);
    return false;
  }
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
