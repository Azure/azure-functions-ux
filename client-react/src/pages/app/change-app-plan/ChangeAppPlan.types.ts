import { ArmObj } from '../../../models/arm-obj';
import { HostingEnvironment } from '../../../models/hostingEnvironment/hosting-environment';
import { ResourceGroup } from '../../../models/resource-group';
import { ServerFarm } from '../../../models/serverFarm/serverfarm';
import { Site } from '../../../models/site/site';
import { CreateOrSelectPlanFormValues } from './CreateOrSelectPlan';

export interface CompletionTelemetry {
  success: boolean;
  newResourceGroup: boolean;
  newPlan: boolean;
  resourceId?: string;
  message?: string;
}

export interface ChangeAppPlanProps {
  site: ArmObj<Site>;
  currentServerFarm: ArmObj<ServerFarm>;
  hostingEnvironment?: ArmObj<HostingEnvironment>;
  resourceGroups: ArmObj<ResourceGroup>[];
  serverFarms: ArmObj<ServerFarm>[];
  onChangeComplete: () => void;
}

export interface ChangeAppPlanFormValues {
  site: ArmObj<Site>;
  currentServerFarm: ArmObj<ServerFarm>;
  serverFarmInfo: CreateOrSelectPlanFormValues;
}

export enum ChangeAppPlanTierTypes {
  Dynamic = 'Dynamic',
  ElasticPremium = 'ElasticPremium',
}
