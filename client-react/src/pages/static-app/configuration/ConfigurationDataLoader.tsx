import React, { useEffect, useState, useContext } from 'react';
import ConfigurationData from './Configuration.data';
import LogService from '../../../utils/LogService';
import { LogCategories } from '../../../utils/LogCategories';
import { getErrorMessageOrStringify } from '../../../ApiHelpers/ArmHelper';
import EnvironmentService from '../../../ApiHelpers/static-site/EnvironmentService';
import { ArmObj } from '../../../models/arm-obj';
import { Environment } from '../../../models/static-site/environment';
import {
  ConfigurationDataLoaderProps,
  ConfigurationFormData,
  ConfigurationYupValidationSchemaType,
  EnvironmentVariable,
} from './Configuration.types';
import { KeyValue } from '../../../models/portal-models';
import { PortalContext } from '../../../PortalContext';
import RbacConstants from '../../../utils/rbac-constants';
import { useTranslation } from 'react-i18next';
import { getTelemetryInfo, stringToPasswordProtectionType } from '../StaticSiteUtility';
import ConfigurationForm from './ConfigurationForm';
import { ConfigurationFormBuilder } from './ConfigurationFormBuilder';
import StaticSiteService from '../../../ApiHelpers/static-site/StaticSiteService';
import { PasswordProtectionTypes } from './Configuration.types';
import { sortBy } from 'lodash-es';
import { StaticSiteSku } from '../skupicker/StaticSiteSkuPicker.types';

const configurationData = new ConfigurationData();
export const ConfigurationContext = React.createContext(configurationData);

const ConfigurationDataLoader: React.FC<ConfigurationDataLoaderProps> = props => {
  const { resourceId } = props;

  const [initialLoading, setInitialLoading] = useState(false);
  const [environments, setEnvironments] = useState<ArmObj<Environment>[]>([]);
  const [selectedEnvironmentVariableResponse, setSelectedEnvironmentVariableResponse] = useState<ArmObj<KeyValue<string>> | undefined>(
    undefined
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasWritePermissions, setHasWritePermissions] = useState(true);
  const [apiFailure, setApiFailure] = useState(false);
  const [configurationFormData, setConfigurationFormData] = useState<ConfigurationFormData | undefined>(undefined);
  const [codeFormValidationSchema, setCodeFormValidationSchema] = useState<ConfigurationYupValidationSchemaType | undefined>(undefined);
  const [staticSiteSku, setStaticSiteSku] = useState<StaticSiteSku>(StaticSiteSku.Standard);

  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const configurationFormBuilder = new ConfigurationFormBuilder(t);

  const fetchData = async (currentEnvironment?: ArmObj<Environment>) => {
    setInitialLoading(true);
    let envResponse: ArmObj<Environment>[] = [];
    let passwordProtection: PasswordProtectionTypes | undefined;

    const appPermission = await portalContext.hasPermission(resourceId, [RbacConstants.writeScope]);
    setHasWritePermissions(appPermission);

    const [environmentResponse, staticSiteAuthResponse, staticSiteResponse] = await Promise.all([
      EnvironmentService.getEnvironments(resourceId),
      StaticSiteService.getStaticSiteBasicAuth(resourceId),
      StaticSiteService.getStaticSite(resourceId),
    ]);

    if (environmentResponse.metadata.success) {
      // TODO(krmitta): Handle nextlinks
      setEnvironments(environmentResponse.data.value);
      envResponse = environmentResponse.data.value;
    } else {
      setApiFailure(true);
      LogService.error(
        LogCategories.staticSiteConfiguration,
        'getEnvironments',
        `Failed to get environments: ${getErrorMessageOrStringify(environmentResponse.metadata.error)}`
      );
    }

    if (staticSiteAuthResponse.metadata.success) {
      passwordProtection = stringToPasswordProtectionType(staticSiteAuthResponse.data.properties.applicableEnvironmentsMode || '');
    } else {
      setApiFailure(true);
      LogService.error(
        LogCategories.staticSiteConfiguration,
        'getStaticSiteBasicAuth',
        `Failed to get basic auth: ${getErrorMessageOrStringify(staticSiteAuthResponse.metadata.error)}`
      );
    }

    if (staticSiteResponse.metadata.success && staticSiteResponse.data.sku && staticSiteResponse.data.sku.name) {
      const skuName =
        staticSiteResponse.data.sku.name &&
        staticSiteResponse.data.sku.name.toLocaleLowerCase() === StaticSiteSku.Standard.toLocaleLowerCase()
          ? StaticSiteSku.Standard
          : StaticSiteSku.Free;
      setStaticSiteSku(skuName);
    } else if (!staticSiteResponse.metadata.success) {
      portalContext.log(getTelemetryInfo('error', 'getStaticSite', 'failed', { error: staticSiteResponse.metadata.error }));
    }

    if (!apiFailure) {
      const defaultEnvironment = currentEnvironment ?? getDefaultEnvironment(envResponse);
      const envVarResponse = await fetchEnvironmentVariables((!!defaultEnvironment && defaultEnvironment.id) || '');
      generateForm(envResponse, passwordProtection, defaultEnvironment, getInitialEnvironmentVariables(envVarResponse));
    }

    setInitialLoading(false);
  };

  const getDefaultEnvironment = (environments: ArmObj<Environment>[]) => {
    return !!environments && environments.length > 0 ? environments[0] : undefined;
  };

  const getInitialEnvironmentVariables = (selectedEnvironmentVariablesResponse?: ArmObj<KeyValue<string>>) => {
    if (selectedEnvironmentVariablesResponse) {
      return sort(ConfigurationData.convertEnvironmentVariablesObjectToArray(selectedEnvironmentVariablesResponse.properties));
    } else {
      return [];
    }
  };

  const sort = (environmentVariables: EnvironmentVariable[]) => {
    return sortBy(environmentVariables, e => e.name.toLocaleLowerCase());
  };

  const fetchEnvironmentVariables = async (environmentResourceId: string) => {
    setInitialLoading(true);
    const environmentSettingsResponse = await EnvironmentService.fetchEnvironmentSettings(environmentResourceId);
    if (environmentSettingsResponse.metadata.success) {
      setSelectedEnvironmentVariableResponse(environmentSettingsResponse.data);
    } else {
      setApiFailure(true);
      LogService.error(
        LogCategories.staticSiteConfiguration,
        'fetchEnvironmentSettings',
        `Failed to fetch environment settings: ${getErrorMessageOrStringify(environmentSettingsResponse.metadata.error)}`
      );
    }
    setInitialLoading(false);
    return environmentSettingsResponse?.data;
  };

  const generateForm = (
    environments?: ArmObj<Environment>[],
    basicAuth?: PasswordProtectionTypes,
    defaultEnvironment?: ArmObj<Environment>,
    defaultEnvironmentVariables?: EnvironmentVariable[]
  ) => {
    setConfigurationFormData(
      configurationFormBuilder.generateFormData(environments, basicAuth, defaultEnvironment, defaultEnvironmentVariables)
    );
    setCodeFormValidationSchema(configurationFormBuilder.generateYupValidationSchema());

    portalContext.log(getTelemetryInfo('info', 'generateForm', 'generated', {}));
  };

  const fetchDataOnEnvironmentChange = async (environmentResourceId: string) => {
    setApiFailure(false);
    await fetchEnvironmentVariables(environmentResourceId);
  };

  const refresh = async (currentEnvironment?: ArmObj<Environment>) => {
    setIsRefreshing(true);
    await fetchData(currentEnvironment);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConfigurationContext.Provider value={configurationData}>
      <ConfigurationForm
        resourceId={resourceId}
        isRefreshing={isRefreshing}
        formData={configurationFormData}
        validationSchema={codeFormValidationSchema}
        environments={environments}
        fetchDataOnEnvironmentChange={fetchDataOnEnvironmentChange}
        selectedEnvironmentVariableResponse={selectedEnvironmentVariableResponse}
        fetchEnvironmentVariables={fetchEnvironmentVariables}
        refresh={refresh}
        isLoading={initialLoading}
        hasWritePermissions={hasWritePermissions}
        apiFailure={apiFailure}
        staticSiteSku={staticSiteSku}
      />
    </ConfigurationContext.Provider>
  );
};

export default ConfigurationDataLoader;
