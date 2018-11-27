import { FunctionAppVersion } from './../models/constants';

export interface FunctionsVersionInfo {
  runtimeStable: string[];
  runtimeDefault: string;
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
    }

    return runtimeVersion.startsWith('~2') || runtimeVersion.startsWith('2') || runtimeVersion.startsWith('beta')
      ? FunctionAppVersion.v2
      : FunctionAppVersion.v1;
  }

  public static getEventGridUri(generation: string, mainSiteUrl: string, functionName: string, code: string) {
    const path = generation === FunctionAppVersion.v1 ? 'admin/extensions/EventGridExtensionConfig' : 'runtime/webhooks/EventGrid';

    return `${mainSiteUrl.toLowerCase()}/${path}?functionName=${functionName}&code=${code}`;
  }
}
