export enum staticSiteSku {
  Free = 'Free',
  Standard = 'Standard',
}
export interface StaticSiteSkuPickerProps {
  isStaticSiteCreate: boolean;
  currentSku: staticSiteSku;
  resourceId: string;
  hasWritePermissions: boolean;
  refresh: () => void;
}
