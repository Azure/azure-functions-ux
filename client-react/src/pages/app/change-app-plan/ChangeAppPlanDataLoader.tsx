import React, { useState, useEffect } from 'react';
import { ResourceGroup } from '../../../models/resource-group';
import { ArmSubcriptionDescriptor } from '../../../utils/resourceDescriptors';
import { ChangeAppPlan } from './ChangeAppPlan';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import SiteService from '../../../ApiHelpers/SiteService';
import ResourceGroupService from '../../../ApiHelpers/ResourceGroupService';
import ServerFarmService from '../../../ApiHelpers/ServerFarmService';
import { ServerFarmSkuConstants } from '../../../utils/scenario-checker/ServerFarmSku';
import LogService from '../../../utils/LogService';
import { HttpResponseObject } from '../../../ArmHelper.types';
import HostingEnvironmentService from '../../../ApiHelpers/HostingEnvironmentService';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import { ServerFarm } from '../../../models/serverFarm/serverfarm';
import { HostingEnvironment } from '../../../models/hostingEnvironment/hosting-environment';
import { isFunctionApp } from '../../../utils/arm-utils';
import { LogCategories } from '../../../utils/LogCategories';

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
            ServerFarmService.fetchServerFarmsForWebspace(descriptor.subscriptionId, siteResult.properties.webSpace),
            fetchAsePromise,
          ]);
        })
        .then(responses => {
          if (!responses[0].metadata.success) {
            LogService.error(
              '/ChangeAppPlanDataLoader',
              'getServerFarmFailed',
              `Failed to get serverFarm with id ${siteResult.properties.serverFarmId}`
            );
            return;
          }

          const aseResponse = responses[2];
          if (aseResponse) {
            if (!aseResponse.metadata.success) {
              // We only use the ASE object to figure out if it's a V1 ASE, in which case we hide the
              // "create new" link for new plans.  If this call fails for any reason (most likely RBAC) then we'll just assume that this is
              // an ASE v2 and make a best effort to allow them to continue with the scenario.
              LogService.error(
                '/ChangeAppPlanDataLoader',
                'getAseFailed',
                `Failed to get ASE with id ${siteResult.properties.hostingEnvironmentId}`
              );
            } else {
              setHostingEnvironment(aseResponse.data);
            }
          }

          setCurrentServerFarm(responses[0].data);
          setServerFarms(filterListToPotentialPlans(siteResult, responses[1]));
          setInitializeData(false);
        });
    }
  };

  const refresh = () => {
    setInitializeData(true);
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

const filterListToPotentialPlans = (site: ArmObj<Site>, serverFarms: ArmObj<ServerFarm>[]) => {
  return serverFarms.filter(serverFarm => {
    if (site.properties.serverFarmId.toLowerCase() === serverFarm.id.toLowerCase()) {
      return false;
    }

    if (!serverFarm.sku) {
      LogService.error(LogCategories.changeAppPlan, '/filterListToPotentialPlans', `Why did serverFarm ${serverFarm.name} not have a SKU?`);
      return false;
    }

    if (
      (site.properties.sku === ServerFarmSkuConstants.Tier.dynamic || site.properties.sku === ServerFarmSkuConstants.Tier.elasticPremium) &&
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

export default ChangeAppPlanDataLoader;
