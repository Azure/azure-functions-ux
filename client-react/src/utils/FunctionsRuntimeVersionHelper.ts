import { RuntimeExtensionMajorVersions } from '../models/functions/runtime-extension';

const parseRuntimeVersion = (runtimeVersion: string | null) => {
  if (!!runtimeVersion) {
    if (runtimeVersion === '1' || runtimeVersion.startsWith('1.')) {
      return RuntimeExtensionMajorVersions.v1;
    }

    if (runtimeVersion === '2' || runtimeVersion.startsWith('2.')) {
      return RuntimeExtensionMajorVersions.v2;
    }

    if (runtimeVersion === '3' || runtimeVersion.startsWith('3.')) {
      return RuntimeExtensionMajorVersions.v3;
    }
  }
  return null;
};

export class FunctionsRuntimeVersionHelper {
  public static getFunctionsRuntimeMajorVersion = (runtimeVersion: string | null) => {
    switch (runtimeVersion) {
      case RuntimeExtensionMajorVersions.v1:
      case RuntimeExtensionMajorVersions.v2:
      case RuntimeExtensionMajorVersions.v3:
        return runtimeVersion;
      default:
        return RuntimeExtensionMajorVersions.custom;
    }
  };

  public static parseExactRuntimeVersion = (exactRuntimeVersion: string | null) => {
    return parseRuntimeVersion(exactRuntimeVersion);
  };

  public static parseConfiguredRuntimeVersion = (configuredRuntimeVersion: string | null) => {
    // remove leading whitespace and single leading '~' if preset
    const runtimeVersion = !!configuredRuntimeVersion
      ? configuredRuntimeVersion.toLowerCase().replace(/^\s*~?/g, '')
      : configuredRuntimeVersion;
    return parseRuntimeVersion(runtimeVersion);
  };
}
