export interface StaticConfig {
  config: {
    env: {
      runtimeType: 'Azure' | 'OnPrem' | 'Standalone';
      hostName: string | undefined;
      azureResourceManagerEndpoint: string;
    };
    cacheBreakQuery: string;
    isAzure: boolean;
    version: string;
  };
}
