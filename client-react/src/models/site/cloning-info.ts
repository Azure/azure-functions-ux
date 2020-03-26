import { KeyValue } from '../portal-models';

export interface CloningInfo {
  correlationId: string;
  overwrite: boolean;
  cloneCustomHostNames: boolean;
  cloneSourceControl: boolean;
  sourceWebAppId: string;
  hostingEnvironment: string;
  appSettingsOverrides: KeyValue<string>;
  configureLoadBalancing: boolean;
  trafficManagerProfileId: string;
  trafficManagerProfileName: string;
  ignoreQuotas: boolean;
}
