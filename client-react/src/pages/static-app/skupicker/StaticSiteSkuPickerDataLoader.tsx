import React from 'react';
import StaticSiteSkuPicker from './StaticSiteSkuPicker';

export interface StaticSiteSkuPickerDataLoaderProps {
  isStaticSiteCreate: boolean;
  currentSku: string;
  resourceId: string;
}
const StaticSiteSkuPickerDataLoader: React.FC<StaticSiteSkuPickerDataLoaderProps> = props => {
  const { resourceId, isStaticSiteCreate, currentSku } = props;

  return <StaticSiteSkuPicker resourceId={resourceId} isStaticSiteCreate={isStaticSiteCreate} currentSku={currentSku} />;
};

export default StaticSiteSkuPickerDataLoader;
