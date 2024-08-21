import { CostEstimate } from '../../../models/BillingModels';

export enum StaticSiteSku {
  Free = 'Free',
  Standard = 'Standard',
}
export interface StaticSiteSkuPickerProps {
  isStaticSiteCreate: boolean;
  currentSku: StaticSiteSku;
  resourceId: string;
  hasWritePermissions: boolean;
  billingInformation: CostEstimate[];
  isBillingInformationLoading: boolean;
  refresh: () => void;
}

export enum StaticSiteBillingType {
  SWAMonthly = 'SWAMonthly',
  SWAIncremental = 'SWAIncremental',
  SWAAzureFrontDoor = 'SWAAzureFrontDoor',
}
