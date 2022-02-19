export enum StaticSiteSku {
  Free = 'Free',
  Standard = 'Standard',
}
export interface StaticSiteSkuPickerProps {
  isStaticSiteCreate: boolean;
  currentSku: StaticSiteSku;
  resourceId: string;
  hasWritePermissions: boolean;
  billingInformation: StaticSiteBillingInformation[];
  isBillingInformationLoading: boolean;
  refresh: () => void;
}

export enum StaticSiteBillingType {
  SWAMonthly = 'SWAMonthly',
  SWAIncremental = 'SWAIncremental',
}

export interface StaticSiteBillingInformation {
  amount: number;
  currencyCode: string;
  firstParty: StaticSiteFirstParty[];
  id: string;
  statusCode: number;
}

export interface StaticSiteFirstParty {
  id: string;
  meters: StaticSiteMeters[];
}

export interface StaticSiteMeters {
  amount: number;
  id: string;
  perUnitAmount: number;
  perUnitCurrencyCode: string;
}

export interface StaticSiteBillingMeter {
  costs: StaticSiteBillingInformation[];
  isSuccess: boolean;
  statusCode: number;
}
