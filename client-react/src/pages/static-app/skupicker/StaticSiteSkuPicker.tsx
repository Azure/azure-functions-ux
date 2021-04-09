import React from 'react';

export interface StaticSiteSkuPickerProps {
  isStaticSiteCreate: boolean;
  currentSku: string;
  resourceId: string;
}

const StaticSiteSkuPicker: React.FC<StaticSiteSkuPickerProps> = props => {
  //TODO (stpelleg): implement sku picker
  return <div>{props.resourceId}</div>;
};

export default StaticSiteSkuPicker;
