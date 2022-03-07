import React, { useContext, useEffect, useState } from 'react';
import StaticSiteService from '../../../ApiHelpers/static-site/StaticSiteService';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import { CostEstimate } from '../../../models/BillingModels';
import { PortalContext } from '../../../PortalContext';
import RbacConstants from '../../../utils/rbac-constants';
import { getTelemetryInfo } from '../../app/deployment-center/utility/DeploymentCenterUtility';
import StaticSiteSkuPicker from './StaticSiteSkuPicker';
import { StaticSiteBillingType, StaticSiteSku } from './StaticSiteSkuPicker.types';

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
  const [billingInformation, setBillingInformation] = useState<CostEstimate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBillingInformationLoading, setIsBillingInformationLoading] = useState(true);

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

  const getSpeCostQueryInput = () => {
    const resourceIdParts = resourceId.split('/');
    const subscriptionId = !!resourceIdParts && resourceIdParts.length > 2 ? resourceIdParts[2] : '';

    return {
      subscriptionId: subscriptionId,
      specResourceSets: [
        {
          id: StaticSiteBillingType.SWAMonthly,
          firstParty: [
            {
              id: StaticSiteBillingType.SWAMonthly,
              quantity: 1,
              resourceId: '56c80fab-f20c-5e41-951d-667dc9503604',
            },
          ],
        },
        {
          id: StaticSiteBillingType.SWAIncremental,
          firstParty: [
            {
              id: StaticSiteBillingType.SWAIncremental,
              quantity: 1,
              resourceId: '0ecf6c02-a907-5918-8591-4f912eb59a31',
            },
          ],
        },
        {
          id: StaticSiteBillingType.SWAAzureFrontDoor,
          firstParty: [
            {
              id: StaticSiteBillingType.SWAAzureFrontDoor,
              quantity: 1,
              resourceId: '03c39429-94d2-5951-bf91-78bf51574b11',
            },
          ],
        },
      ],
      specsToAllowZeroCost: [],
      specType: 'WebsitesExtension',
      IsRpcCall: true,
    };
  };

  const getBillingMeters = async () => {
    setIsBillingInformationLoading(true);

    const specCostObservable = await portalContext.getSpecCosts(getSpeCostQueryInput());
    specCostObservable.subscribe(specCostResult => {
      if (specCostResult) {
        setBillingInformation([...specCostResult.costs]);
      } else {
        portalContext.log(getTelemetryInfo('error', 'getStaticSiteBillingInformation', 'failed'));
      }
    });

    setIsBillingInformationLoading(false);
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
      isBillingInformationLoading={isBillingInformationLoading}
      refresh={refresh}
    />
  );
};

export default StaticSiteSkuPickerDataLoader;
