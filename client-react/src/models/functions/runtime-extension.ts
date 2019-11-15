export interface RuntimeExtension {
  id: string;
  version: string;
}

export enum RuntimeExtensionMajorVersions {
  v1 = '~1',
  v2 = '~2',
  v3 = '~3',
  custom = 'custom',
}
