export interface PricingTier {
  name: string;
  skuName: string;
  workerTierName: string;
  workerTierId: number;
  computeVmSize: string;
  estimatedPrice: number;
  currencyCode: string;
  isLinux: boolean;
  isXenon: boolean;
  specGroup: string;
  specSection: string;
  computeMode: string;
  numberOfCores: number;
  memorySize: number;
  osVersion: string;
  adIntegration: boolean;
  availableInstances: number;
  skuSettings: string;
  numberOfSlotsPerSite: number;
  numberOfVirtualWorkers: number;
  backupPeriodHours: number;
  numberOfBackups: number;
  numberOfWorkersPerSite: number;
  fileSystemStorageInMB: number;
  customDomainsEnabled: number;
}
