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
import { KeyValue } from '../../../models/portal-models';

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
  const [selectedEnvironmentVariableResponse, setSelectedEnvironmentVariableResponse] = useState<ArmObj<KeyValue<string>> | undefined>(
    undefined
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setInitialLoading(true);
    setIsRefreshing(true);
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
    const environmentSettingsResponse = await EnvironmentService.fetchEnvironmentSettings(environmentResourceId);
    if (environmentSettingsResponse.metadata.success) {
      setSelectedEnvironmentVariableResponse(environmentSettingsResponse.data);
    } else {
      LogService.error(
        LogCategories.staticSiteConfiguration,
        'fetchEnvironmentSettings',
        `Failed to fetch environment settings: ${getErrorMessageOrStringify(environmentSettingsResponse.metadata.error)}`
      );
    }
    setIsRefreshing(false);
  };

  const saveEnvironmentVariables = async (environmentResourceId: string, environmentVariables: EnvironmentVariable[]) => {
    if (!!selectedEnvironmentVariableResponse) {
      const updatedEnvironmentVariablesObject = ConfigurationData.convertEnvironmentVariablesArrayToObject(environmentVariables);
      const updatedEnvironmentVariableRequest = selectedEnvironmentVariableResponse;
      updatedEnvironmentVariableRequest.properties = updatedEnvironmentVariablesObject;
      const environmentSettingsResponse = await EnvironmentService.saveEnvironmentVariables(
        environmentResourceId,
        updatedEnvironmentVariableRequest
      );
      if (environmentSettingsResponse.metadata.success) {
        setSelectedEnvironmentVariableResponse(environmentSettingsResponse.data);
      } else {
        LogService.error(
          LogCategories.staticSiteConfiguration,
          'saveEnvironmentSettings',
          `Failed to save environment settings: ${getErrorMessageOrStringify(environmentSettingsResponse.metadata.error)}`
        );
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

  if (!staticSite || initialLoading) {
    return <LoadingComponent />;
  }

  return (
    <ConfigurationContext.Provider value={configurationData}>
      <Configuration
        staticSite={staticSite}
        environments={environments}
        fetchEnvironmentVariables={fetchEnvironmentVariables}
        selectedEnvironmentVariableResponse={selectedEnvironmentVariableResponse}
        saveEnvironmentVariables={saveEnvironmentVariables}
        refresh={refresh}
        isRefreshing={isRefreshing}
      />
    </ConfigurationContext.Provider>
  );
};

export default ConfigurationDataLoader;
