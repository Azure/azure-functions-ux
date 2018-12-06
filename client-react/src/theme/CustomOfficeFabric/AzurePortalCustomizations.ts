import { AzurePortalStyles } from './AzurePortal/AzurePortalStyles';
import { ICustomizations } from 'office-ui-fabric-react';

export const AzurePortalCustomizations: ICustomizations = {
  settings: {},
  scopedSettings: { ...AzurePortalStyles },
};
