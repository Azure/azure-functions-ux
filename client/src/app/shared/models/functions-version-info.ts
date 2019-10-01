import { FunctionAppVersion } from './../models/constants';

export interface FunctionsVersionInfo {
  runtimeStable: string[];
  runtimeDefault: string;
}

export function runtimeIsV1(runtimeVersion: string): boolean {
  return runtimeVersion === FunctionAppVersion.v1;
}

export function runtimeIsV2(runtimeVersion: string): boolean {
  return runtimeVersion === FunctionAppVersion.v2;
}

export function runtimeIsV3(runtimeVersion: string): boolean {
  return runtimeVersion === FunctionAppVersion.v3;
}

export class FunctionsVersionInfoHelper {
  public static needToUpdateRuntime(version: FunctionsVersionInfo, extensionVersion: string) {
    const match = version.runtimeStable.find(v => {
      return extensionVersion.toLowerCase() === v;
    });
    return !match;
  }

  public static getFunctionGeneration(runtimeVersion: string) {
    if (!runtimeVersion) {
      return FunctionAppVersion.v1;
    } else if (runtimeVersion.startsWith('~2') || runtimeVersion.startsWith('2') || runtimeVersion.startsWith('beta')) {
      return FunctionAppVersion.v2;
    } else if (runtimeVersion.startsWith('~3') || runtimeVersion.startsWith('3')) {
      return FunctionAppVersion.v3;
    }

    return FunctionAppVersion.v1;
  }

  public static getEventGridUri(generation: string, mainSiteUrl: string, functionName: string, code: string) {
    const path = generation === FunctionAppVersion.v1 ? 'admin/extensions/EventGridExtensionConfig' : 'runtime/webhooks/EventGrid';

    return `${mainSiteUrl.toLowerCase()}/${path}?functionName=${functionName}&code=${code}`;
  }
}
