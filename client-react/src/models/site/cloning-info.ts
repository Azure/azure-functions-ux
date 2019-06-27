export interface CloningInfo {
  correlationId: string;
  overwrite: boolean;
  cloneCustomHostNames: boolean;
  cloneSourceControl: boolean;
  sourceWebAppId: string;
  hostingEnvironment: string;
  appSettingsOverrides: { [key: string]: string };
  configureLoadBalancing: boolean;
  trafficManagerProfileId: string;
  trafficManagerProfileName: string;
  ignoreQuotas: boolean;
}
