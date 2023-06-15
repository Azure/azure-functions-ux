import React, { useContext, useEffect, useState } from 'react';

import HostingEnvironmentService from '../../../ApiHelpers/HostingEnvironmentService';
import ResourceGroupService from '../../../ApiHelpers/ResourceGroupService';
import ServerFarmService from '../../../ApiHelpers/ServerFarmService';
import SiteService from '../../../ApiHelpers/SiteService';
import { HttpResponseObject } from '../../../ArmHelper.types';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import { ArmObj } from '../../../models/arm-obj';
import { HostingEnvironment } from '../../../models/hostingEnvironment/hosting-environment';
import { ResourceGroup } from '../../../models/resource-group';
import { ServerFarm } from '../../../models/serverFarm/serverfarm';
import { Site } from '../../../models/site/site';
import { PortalContext } from '../../../PortalContext';
import { isFunctionApp, isLinuxApp } from '../../../utils/arm-utils';
import { ArmSubcriptionDescriptor } from '../../../utils/resourceDescriptors';
import { ServerFarmSkuConstants } from '../../../utils/scenario-checker/ServerFarmSku';
import { getTelemetryInfo } from '../../../utils/TelemetryUtils';
import { ChangeAppPlan } from './ChangeAppPlan';
import { ChangeAppPlanTierTypes } from './ChangeAppPlan.types';

interface ChangeAppPlanDataLoaderProps {
  resourceId: string;
}

const ChangeAppPlanDataLoader: React.SFC<ChangeAppPlanDataLoaderProps> = props => {
  const [site, setSite] = useState<ArmObj<Site> | null>(null);
  const [currentServerFarm, setCurrentServerFarm] = useState<ArmObj<ServerFarm> | null>(null);
  const [hostingEnvironment, setHostingEnvironment] = useState<ArmObj<HostingEnvironment> | null>(null);
  const [resourceGroups, setResourceGroups] = useState<ArmObj<ResourceGroup>[] | null>(null);
  const [serverFarms, setServerFarms] = useState<ArmObj<ServerFarm>[] | null>(null);
  const [initializeData, setInitializeData] = useState(true);
  const portalCommunicator = useContext(PortalContext);

  const resourceId = props.resourceId;
  let siteResult: ArmObj<Site>;

  const fetchData = async () => {
    if (initializeData) {
      const descriptor = new ArmSubcriptionDescriptor(resourceId);

      await Promise.all([SiteService.fetchSite(resourceId), ResourceGroupService.fetchResourceGroups(descriptor.subscriptionId)])
        .then(responses => {
          siteResult = responses[0].data;
          setSite(responses[0].data);
          setResourceGroups(responses[1]);

          let fetchAsePromise: Promise<HttpResponseObject<ArmObj<HostingEnvironment>> | null> = Promise.resolve(null);

          if (siteResult.properties.hostingEnvironmentId) {
            fetchAsePromise = HostingEnvironmentService.fetchHostingEnvironment(siteResult.properties.hostingEnvironmentId);
          }

          // Not explicitly checking for read access on the current serverFarm because it's already checked in the menu blade

          return Promise.all([
            // We make a separate call for the site's serverFarm because ARG has 1-min SLA for caching. This guarantees that we will
            // always get the current serverFarm object if they went ahead and created a new serverFarm and then came back here right away
            ServerFarmService.fetchServerFarm(siteResult.properties.serverFarmId),
            ServerFarmService.fetchServerFarmsForWebspace(descriptor.subscriptionId, siteResult.properties.webSpace, portalCommunicator),
            fetchAsePromise,
          ]);
        })
        .then(responses => {
          if (!responses[0].metadata.success) {
            portalCommunicator.log(
              getTelemetryInfo('error', 'getServerFarmFailed', 'failed', {
                error: responses[0].metadata.error,
                message: 'Failed to get server farm',
              })
            );
            return;
          }

          const aseResponse = responses[2];
          if (aseResponse) {
            if (!aseResponse.metadata.success) {
              // We only use the ASE object to figure out if it's a V1 ASE, in which case we hide the
              // "create new" link for new plans.  If this call fails for any reason (most likely RBAC) then we'll just assume that this is
              // an ASE v2 and make a best effort to allow them to continue with the scenario.
              portalCommunicator.log(
                getTelemetryInfo('error', 'getAseFailed', 'failed', {
                  error: aseResponse.metadata.error,
                  message: 'Failed to get ase',
                })
              );
            } else {
              setHostingEnvironment(aseResponse.data);
            }
          }

          setCurrentServerFarm(responses[0].data);
          setServerFarms(filterListToPotentialPlans(siteResult, responses[1], consumptionToPremiumEnabled(responses[0].data, site)));
          setInitializeData(false);
        });
    }
  };

  const refresh = () => {
    setInitializeData(true);
  };

  const filterListToPotentialPlans = (site: ArmObj<Site>, serverFarms: ArmObj<ServerFarm>[], consumptionToPremiumEnabled: boolean) => {
    return serverFarms.filter(serverFarm => {
      if (site.properties.serverFarmId.toLowerCase() === serverFarm.id.toLowerCase()) {
        return false;
      }

      if (!serverFarm.sku) {
        portalCommunicator.log(
          getTelemetryInfo('error', 'filterListToPotentialPlans', 'failed', {
            message: `Server farm: ${serverFarm.name} did not have a SKU`,
          })
        );
        return false;
      }

      if (
        !consumptionToPremiumEnabled &&
        (site.properties.sku === ServerFarmSkuConstants.Tier.dynamic ||
          site.properties.sku === ServerFarmSkuConstants.Tier.elasticPremium) &&
        serverFarm.sku.tier !== site.properties.sku
      ) {
        return false;
      } else if (
        !isFunctionApp(site) &&
        (serverFarm.sku.tier === ServerFarmSkuConstants.Tier.dynamic || serverFarm.sku.tier === ServerFarmSkuConstants.Tier.elasticPremium)
      ) {
        return false;
      }

      return true;
    });
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceId, initializeData]);

  if (initializeData) {
    return <LoadingComponent />;
  }

  return (
    <ChangeAppPlan
      site={site as ArmObj<Site>}
      currentServerFarm={currentServerFarm as ArmObj<ServerFarm>}
      hostingEnvironment={hostingEnvironment as ArmObj<HostingEnvironment>}
      resourceGroups={resourceGroups as ArmObj<ResourceGroup>[]}
      serverFarms={serverFarms as ArmObj<ServerFarm>[]}
      onChangeComplete={refresh}
    />
  );
};

export const consumptionToPremiumEnabled = (currentServerFarm: ArmObj<ServerFarm> | null, site: ArmObj<Site> | null) => {
  const currentTier = currentServerFarm?.sku?.tier.toLocaleLowerCase();
  const isDynamicOrPremium =
    currentTier === ChangeAppPlanTierTypes.Dynamic.toLocaleLowerCase() ||
    currentTier === ChangeAppPlanTierTypes.ElasticPremium.toLocaleLowerCase();
  const isLinux = !!site && isLinuxApp(site);
  return isDynamicOrPremium && !isLinux;
};

export default ChangeAppPlanDataLoader;
