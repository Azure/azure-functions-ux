import { HostingEnvironmentProfile } from '../hostingEnvironment/hosting-environment-profile';
import { KeyValue } from '../portal-models';

export interface ServerFarm {
  serverFarmId: number;
  name: string;
  workerSize: number;
  workerSizeId: number;
  targetWorkerSizeId: number;
  targetWorkerCount: number;
  provisioningState: string;
  numberOfWorkers: number;
  currentWorkerSize: number;
  currentWorkerSizeId: number;
  currentNumberOfWorkers: number;
  status: number;
  webSpace: string;
  subscription: string;
  adminSiteName: string;
  hostingEnvironmentProfile: HostingEnvironmentProfile;
  maximumNumberOfWorkers: number;
  planName: string;
  adminRuntimeSiteName: string;
  computeMode: number;
  siteMode: string;
  geoRegion: string;
  perSiteScaling: boolean;
  numberOfSites: number;
  sKUScaleTime: Date;
  hostingEnvironmentId: string;
  isLinux: boolean;
  isXenon: boolean;
  hyperV: boolean;
  kind: string;
  reserved: boolean;
  tags: KeyValue<string>;
  resourceGroup: string;
  freeOfferExpirationTime: Date;

  // The resourceId of a site that you want to match the webspace of during creation
  webSiteId?: string;
}
