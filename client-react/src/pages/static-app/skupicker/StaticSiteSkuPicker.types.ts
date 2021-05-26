export enum StaticSiteSku {
  Free = 'Free',
  Standard = 'Standard',
}
export interface StaticSiteSkuPickerProps {
  isStaticSiteCreate: boolean;
  currentSku: StaticSiteSku;
  resourceId: string;
  hasWritePermissions: boolean;
  billingInformation: staticSiteBillingInformation[];
  refresh: () => void;
}

export enum StaticSiteBillingType {
  SWAMonthly = 'SWAMonthly',
  SWAIncremental = 'SWAIncremental',
}

export interface staticSiteBillingInformation {
  amount: number;
  currencyCode: string;
  firstParty: staticSiteFirstParty[];
  id: string;
  statusCode: number;
}

export interface staticSiteFirstParty {
  id: string;
  meters: staticSiteMeters[];
}

export interface staticSiteMeters {
  amount: number;
  id: string;
  perUnitAmount: number;
  perUnitCurrencyCode: string;
}
