import React, { useEffect, useState } from 'react';
import ConfigurationData from './Configuration.data';
import Configuration from './Configuration';
import StaticSiteService from '../../../ApiHelpers/static-site/StaticSiteService';
import LogService from '../../../utils/LogService';
import { LogCategories } from '../../../utils/LogCategories';
import { getErrorMessageOrStringify } from '../../../ApiHelpers/ArmHelper';
import EnvironmentService from '../../../ApiHelpers/static-site/EnvironmentService';
import { ArmObj } from '../../../models/arm-obj';
import { StaticSite } from '../../../models/static-site/static-site';
import { Environment } from '../../../models/static-site/environment';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import { EnvironmentVariable } from './Configuration.types';

const configurationData = new ConfigurationData();
export const ConfigurationContext = React.createContext(configurationData);

interface ConfigurationDataLoaderProps {
  resourceId: string;
}

const ConfigurationDataLoader: React.FC<ConfigurationDataLoaderProps> = props => {
  const { resourceId } = props;

  const [initialLoading, setInitialLoading] = useState(false);
  const [staticSite, setStaticSite] = useState<ArmObj<StaticSite> | undefined>(undefined);
  const [environments, setEnvironments] = useState<ArmObj<Environment>[]>([]);
  const [environmentVariables, setEnvironmentVariables] = useState<EnvironmentVariable[]>([]);

  const fetchData = async () => {
    setInitialLoading(true);
    const [staticSiteResponse, environmentResponse] = await Promise.all([
      StaticSiteService.getStaticSite(resourceId),
      EnvironmentService.getEnvironments(resourceId),
    ]);

    if (staticSiteResponse.metadata.success) {
      setStaticSite(staticSiteResponse.data);
    } else {
      LogService.error(
        LogCategories.staticSiteConfiguration,
        'getStaticSite',
        `Failed to get static site: ${getErrorMessageOrStringify(staticSiteResponse.metadata.error)}`
      );
    }

    if (environmentResponse.metadata.success) {
      // TODO(krmitta): Handle nextlinks
      setEnvironments(environmentResponse.data.value);
    } else {
      LogService.error(
        LogCategories.staticSiteConfiguration,
        'getEnvironments',
        `Failed to get environments: ${getErrorMessageOrStringify(environmentResponse.metadata.error)}`
      );
    }

    setInitialLoading(false);
  };

  const fetchEnvironmentVariables = async (environmentResourceId: string) => {
    setEnvironmentVariables([]);
    const environmentSettingsResponse = await EnvironmentService.fetchEnvironmentSettings(environmentResourceId);
    if (environmentSettingsResponse.metadata.success) {
      setEnvironmentVariables(ConfigurationData.convertEnvironmentVariablesObjectToArray(environmentSettingsResponse.data.properties));
    } else {
      LogService.error(
        LogCategories.staticSiteConfiguration,
        'fetchEnvironmentSettings',
        `Failed to fetch environment settings: ${getErrorMessageOrStringify(environmentSettingsResponse.metadata.error)}`
      );
    }
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!staticSite || initialLoading) {
    return <LoadingComponent />;
  }

  return (
    <ConfigurationContext.Provider value={configurationData}>
      <Configuration
        staticSite={staticSite}
        environments={environments}
        fetchEnvironmentVariables={fetchEnvironmentVariables}
        environmentVariables={environmentVariables}
      />
    </ConfigurationContext.Provider>
  );
};

export default ConfigurationDataLoader;
