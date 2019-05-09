import React, { useState, useEffect } from 'react';
import { ArmObj, Site, ServerFarm } from '../../../models/WebAppModels';
import { ResourceGroup } from '../../../models/resource-group';
import { ArmSubcriptionDescriptor } from '../../../utils/resourceDescriptors';
import { ChangeAppPlan } from './ChangeAppPlan';
import LoadingComponent from '../../../components/loading/loading-component';
import SiteService from '../../../ApiHelpers/SiteService';
import ResourceGroupService from '../../../ApiHelpers/ResourceGroupService';
import ServerFarmService from '../../../ApiHelpers/ServerFarmService';
import { ServerFarmSkuConstants } from '../../../utils/scenario-checker/ServerFarmSku';
import LogService from '../../../utils/LogService';

interface ChangeAppPlanDataLoaderProps {
  resourceId: string;
}

const ChangeAppPlanDataLoader: React.SFC<ChangeAppPlanDataLoaderProps> = props => {
  const [site, setSite] = useState<ArmObj<Site> | null>(null);
  const [currentServerFarm, setCurrentServerFarm] = useState<ArmObj<ServerFarm> | null>(null);
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

          return Promise.all([
            // We make a separate call for the site's serverFarm because ARG has 1-min SLA for caching. This guarantees that we will
            // always get the current serverFarm object if they went ahead and created a new serverFarm and then came back here right away
            ServerFarmService.fetchServerFarm(siteResult.properties.serverFarmId),
            ServerFarmService.fetchServerFarmsForWebspace(descriptor.subscriptionId, siteResult.properties.webSpace),
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
  }, [resourceId, initializeData]);

  if (initializeData) {
    return <LoadingComponent />;
  }

  return (
    <div style={{ padding: '30px' }}>
      <ChangeAppPlan
        site={site as ArmObj<Site>}
        currentServerFarm={currentServerFarm as ArmObj<ServerFarm>}
        resourceGroups={resourceGroups as ArmObj<ResourceGroup>[]}
        serverFarms={serverFarms as ArmObj<ServerFarm>[]}
        onChangeComplete={refresh}
      />
    </div>
  );
};

const filterListToPotentialPlans = (site: ArmObj<Site>, serverFarms: ArmObj<ServerFarm>[]) => {
  return serverFarms.filter(s => {
    if (site.properties.serverFarmId.toLowerCase() === s.id.toLowerCase()) {
      return false;
    }

    if (
      (site.properties.sku === ServerFarmSkuConstants.Tier.dynamic || site.properties.sku === ServerFarmSkuConstants.Tier.elasticPremium) &&
      s.sku &&
      s.sku.tier !== site.properties.sku
    ) {
      return false;
    }

    return true;
  });
};

export default ChangeAppPlanDataLoader;
