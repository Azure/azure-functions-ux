import React, { useContext, useEffect, useState } from 'react';
import StaticSiteService from '../../../ApiHelpers/static-site/StaticSiteService';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import { PortalContext } from '../../../PortalContext';
import RbacConstants from '../../../utils/rbac-constants';
import { getTelemetryInfo } from '../../app/deployment-center/utility/DeploymentCenterUtility';
import StaticSiteSkuPicker from './StaticSiteSkuPicker';
import { StaticSiteSku } from './StaticSiteSkuPicker.types';

export interface StaticSiteSkuPickerDataLoaderProps {
  isStaticSiteCreate: boolean;
  currentSku: StaticSiteSku;
  resourceId: string;
}

const StaticSiteSkuPickerDataLoader: React.FC<StaticSiteSkuPickerDataLoaderProps> = props => {
  const { resourceId, isStaticSiteCreate, currentSku } = props;

  const portalContext = useContext(PortalContext);

  const [hasWritePermissions, setHasWritePermissions] = useState(true);
  const [currentSiteSku, setCurrentSiteSku] = useState<StaticSiteSku>(currentSku);
  const [billingInformation, setBillingInformation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    getBillingMeters();

    await Promise.all([getWritePermissions(), getCurrentSku()]);

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
        const skuName =
          staticSiteResponse.data.sku.name &&
          staticSiteResponse.data.sku.name.toLocaleLowerCase() === StaticSiteSku.Standard.toLocaleLowerCase()
            ? StaticSiteSku.Standard
            : StaticSiteSku.Free;
        setCurrentSiteSku(skuName);
      } else if (!staticSiteResponse.metadata.success) {
        portalContext.log(getTelemetryInfo('error', 'getStaticSite', 'failed', { error: staticSiteResponse.metadata.error }));
      }
    }
  };

  const getBillingMeters = async () => {
    const resourceIdParts = !!resourceId ? resourceId.split('/') : [];
    const subscriptionId = !!resourceIdParts && resourceIdParts.length > 2 ? resourceIdParts[2] : '';
    const billingMetersResponse = await StaticSiteService.getStaticSiteBillingMeters(subscriptionId);

    if (billingMetersResponse.metadata.success && billingMetersResponse.data.isSuccess) {
      setBillingInformation(billingMetersResponse.data.costs);
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'getStaticSiteBillingInformation', 'failed', { error: billingMetersResponse.metadata.error })
      );
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
      billingInformation={billingInformation}
      refresh={refresh}
    />
  );
};

export default StaticSiteSkuPickerDataLoader;
