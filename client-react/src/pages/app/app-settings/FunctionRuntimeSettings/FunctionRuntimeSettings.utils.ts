import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';

export const getFunctionsRuntimeMajorVersion = (version: string | null) => {
  switch (version) {
    case RuntimeExtensionMajorVersions.v1:
      return RuntimeExtensionMajorVersions.v1;
    case RuntimeExtensionMajorVersions.v2:
      return RuntimeExtensionMajorVersions.v2;
    case RuntimeExtensionMajorVersions.v3:
      return RuntimeExtensionMajorVersions.v3;
    default:
      return RuntimeExtensionMajorVersions.custom;
  }
};

export const parseExactRuntimeVersion = (exactRuntimeVersion: string) => {
  if (exactRuntimeVersion.startsWith('1.')) {
    return RuntimeExtensionMajorVersions.v1;
  }

  if (exactRuntimeVersion.startsWith('2.')) {
    return RuntimeExtensionMajorVersions.v2;
  }

  if (exactRuntimeVersion.startsWith('3.')) {
    return RuntimeExtensionMajorVersions.v3;
  }

  return RuntimeExtensionMajorVersions.v3;
};
