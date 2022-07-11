import { FormikProps } from 'formik';
import { ArmObj } from '../../../models/arm-obj';
import { HostingEnvironment } from '../../../models/hostingEnvironment/hosting-environment';
import { HostingEnvironmentProfile } from '../../../models/hostingEnvironment/hosting-environment-profile';
import { ResourceGroup } from '../../../models/resource-group';
import { ServerFarm } from '../../../models/serverFarm/serverfarm';
import { Site } from '../../../models/site/site';
import { CreateOrSelectPlanFormValues } from './CreateOrSelectPlan';

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

export enum ChangeAppPlanDefaultSkuCodes {
  Dynamic = 'Y1',
  ElasticPremium = 'EP1',
}

export interface ChangeAppPlanFooterProps {
  isUpdating: boolean;
  siteIsReadOnlyLocked: boolean;
  submitForm: () => void;
}

export interface DestinationPlanDetailsProps {
  isUpdating: boolean;
  formProps: FormikProps<ChangeAppPlanFormValues>;
  currentServerFarm: ArmObj<ServerFarm>;
  resourceGroups: ArmObj<ResourceGroup>[];
  serverFarms: ArmObj<ServerFarm>[];
  hostingEnvironment?: ArmObj<HostingEnvironment>;
}

export interface CurrentPlanDetailsProps {
  currentServerFarm: ArmObj<ServerFarm>;
}

export interface NewServerFarmInfo {
  id: string;
  name: string;
  location: string;
  properties: NewServerFarm;
  kind?: string;
  sku?: {
    name: string;
  };
}

export interface NewServerFarm {
  reserved: boolean;
  hyperV: boolean;
  hostingEnvironmentId: string;
  hostingEnvironmentProfile: HostingEnvironmentProfile;
  maximumElasticWorkerCount?: number;
  // The resourceId of a site that you want to match the webspace of during creation
  webSiteId?: string;
}
