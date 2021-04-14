import React, { useContext, useEffect, useState } from 'react';
import { PortalContext } from '../../../PortalContext';
import RbacConstants from '../../../utils/rbac-constants';
import StaticSiteSkuPicker from './StaticSiteSkuPicker';

export interface StaticSiteSkuPickerDataLoaderProps {
  isStaticSiteCreate: boolean;
  currentSku: string;
  resourceId: string;
}
const StaticSiteSkuPickerDataLoader: React.FC<StaticSiteSkuPickerDataLoaderProps> = props => {
  const { resourceId, isStaticSiteCreate, currentSku } = props;

  const portalContext = useContext(PortalContext);

  const [hasWritePermissions, setHasWritePermissions] = useState(true);

  const fetchData = async () => {
    const appPermission = await portalContext.hasPermission(resourceId, [RbacConstants.writeScope]);
    setHasWritePermissions(appPermission);
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StaticSiteSkuPicker
      resourceId={resourceId}
      isStaticSiteCreate={isStaticSiteCreate}
      currentSku={currentSku}
      hasWritePermissions={hasWritePermissions}
    />
  );
};

export default StaticSiteSkuPickerDataLoader;
