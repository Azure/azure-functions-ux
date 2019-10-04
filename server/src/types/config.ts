export interface StaticConfig {
  config: {
    env: {
      runtimeType: 'Azure' | 'OnPrem' | 'Standalone';
      hostName: string | undefined;
      azureResourceManagerEndpoint: string;
      appName: string;
    };
    cacheBreakQuery: string;
    isAzure: boolean;
    version: string;
    functionsVersionInfo: {
      runtimeStable: string[];
      runtimeDefault: string;
    };
  };
}

export interface HomeConfig extends StaticConfig {
  version: string;
  versionConfig: string;
  clientOptimizationsOff: boolean;
}
