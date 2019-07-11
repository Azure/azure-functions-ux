import { NameValuePair } from '../name-value-pair';

export interface HostingEnvironment {
  kind: string;
  id: string;
  name: string;
  location: string;
  status: number;
  publicHost: string;
  vNETName: string;
  vNETResourceGroupName: string;
  vNETSubnetName: string;
  virtualNetwork: VirtualNetworkProfile;
  frontEndScaleFactor: number;
  multiSize: string;
  multiRoleCount: number;
  workerPools: WorkerPool;
  iPSSLAddressCount: number;
  databaseEdition: string;
  databaseServiceObjective: string;
  upgradeDomains: number;
  subscriptionId: string;
  dnsSuffix: string;
  lastAction: string;
  lastActionResult: string;
  allowedMultiSizes: string;
  allowedWorkerSizes: string;
  maximumNumberOfMachines: number;
  vipMappings: VirtualIPMapping;
  environmentCapacities: StampCapacity;
  networkAccessControlList: NetworkAccessControlEntry;
  environmentIsHealthy: boolean;
  environmentStatus: string;
  resourceGroup: string;
  apiManagementAccountId: string;
  internalLoadBalancingMode: number;
  clusterSettings: NameValuePair;
  hasLinuxWorkers: boolean;
  suspended: boolean;
}

export interface VirtualNetworkProfile {
  id: string;
  name: string;
  type: string;
  subnet: string;
}

export interface WorkerPool {
  workerSizeId: number;
  computeMode: number;
  workerSize: string;
  workerCount: number;
  instanceNames: string;
  sku: SkuDescription;
}

export interface VirtualIPMapping {
  virtualIP: string;
  internalHttpPort: number;
  internalHttpsPort: number;
  inUse: boolean;
}

export interface StampCapacity {
  name: string;
  availableCapacity: number;
  totalCapacity: number;
  unit: string;
  computeMode: number;
  workerSize: number;
  workerSizeId: number;
  excludeFromCapacityAllocation: boolean;
  isApplicableForAllComputeModes: boolean;
  siteMode: string;
}

export interface NetworkAccessControlEntry {
  action: number;
  description: string;
  order: number;
  remoteSubnet: string;
}

export interface SkuDescription {
  name: string;
  tier: string;
  size: string;
  family: string;
  capacity: number;
}
