import React, { useContext, useEffect, useState } from 'react';
import StaticSiteService from '../../../ApiHelpers/static-site/StaticSiteService';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import { PortalContext } from '../../../PortalContext';
import RbacConstants from '../../../utils/rbac-constants';
import { getTelemetryInfo } from '../../app/deployment-center/utility/DeploymentCenterUtility';
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
  const [currentSiteSku, setCurrentSiteSku] = useState<string>(currentSku);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);

    await getWritePermissions();
    await getCurrentSku();

    setIsLoading(false);
  };

  const getWritePermissions = async () => {
    const appPermission = await portalContext.hasPermission(resourceId, [RbacConstants.writeScope]);
    setHasWritePermissions(appPermission);
  };

  const getCurrentSku = async () => {
    if (!isStaticSiteCreate) {
      const staticSiteResponse = await StaticSiteService.getStaticSite(resourceId);

      if (staticSiteResponse.metadata.success && staticSiteResponse.data.sku && staticSiteResponse.data.sku.name) {
        setCurrentSiteSku(staticSiteResponse.data.sku.name);
      } else {
        portalContext.log(getTelemetryInfo('error', 'getStaticSite', 'failed', { error: staticSiteResponse.metadata.error }));
      }
    }
  };

  const refresh = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <StaticSiteSkuPicker
      resourceId={resourceId}
      isStaticSiteCreate={isStaticSiteCreate}
      currentSku={currentSiteSku}
      hasWritePermissions={hasWritePermissions}
      refresh={refresh}
    />
  );
};

export default StaticSiteSkuPickerDataLoader;
