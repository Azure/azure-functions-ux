export enum staticSiteSku {
  Free = 'Free',
  Standard = 'Standard',
}
export interface StaticSiteSkuPickerProps {
  isStaticSiteCreate: boolean;
  currentSku: string;
  resourceId: string;
  hasWritePermissions: boolean;
}
