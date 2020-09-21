export interface StaticAngularConfig {
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

export interface AngularHomeConfig extends StaticAngularConfig {
  version: string;
  versionConfig: string;
  clientOptimizationsOff: boolean;
}

export type CloudType = 'onprem' | 'public' | 'fairfax' | 'mooncake' | 'blackforest' | 'usnat' | 'ussec';

export interface ReactEnvironment {
  hostName: string;
  azureResourceManagerEndpoint?: string;
  armToken?: string;
  appName: string;
  cloud: CloudType;
  acceptedOriginsSuffix: string[];
}

export interface StaticReactConfig {
  env: ReactEnvironment;
  version: string;
}
