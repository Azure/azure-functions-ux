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

  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const configurationFormBuilder = new ConfigurationFormBuilder(t);

  const fetchData = async () => {
    setInitialLoading(true);
    let envResponse: ArmObj<Environment>[] = [];
    let passwordProtection: PasswordProtectionTypes | undefined = undefined;

    const appPermission = await portalContext.hasPermission(resourceId, [RbacConstants.writeScope]);
    setHasWritePermissions(appPermission);

    const [environmentResponse, staticSiteAuthResponse] = await Promise.all([
      EnvironmentService.getEnvironments(resourceId),
      StaticSiteService.getStaticSiteBasicAuth(resourceId),
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
      const passwordProtectionType = stringToPasswordProtectionType(
        staticSiteAuthResponse.data.properties.applicableEnvironmentsMode || ''
      );
      passwordProtection = passwordProtectionType;
    } else {
      setApiFailure(true);
      LogService.error(
        LogCategories.staticSiteConfiguration,
        'getStaticSiteBasicAuth',
        `Failed to get environments: ${getErrorMessageOrStringify(staticSiteAuthResponse.metadata.error)}`
      );
    }

    if (!apiFailure) {
      generateForm(envResponse, passwordProtection);
    }

    setInitialLoading(false);
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
  };

  const saveEnvironmentVariables = async (environmentResourceId: string, environmentVariables: EnvironmentVariable[]) => {
    if (!!selectedEnvironmentVariableResponse) {
      setInitialLoading(true);
      const updatedEnvironmentVariablesObject = ConfigurationData.convertEnvironmentVariablesArrayToObject(environmentVariables);
      const updatedEnvironmentVariableRequest = selectedEnvironmentVariableResponse;
      updatedEnvironmentVariableRequest.properties = updatedEnvironmentVariablesObject;
      const environmentSettingsResponse = await EnvironmentService.saveEnvironmentVariables(
        environmentResourceId,
        updatedEnvironmentVariableRequest
      );
      const notificationId = portalContext.startNotification(t('staticSite_configUpdating'), t('staticSite_configUpdating'));
      if (environmentSettingsResponse.metadata.success) {
        fetchEnvironmentVariables(environmentResourceId);
        portalContext.stopNotification(notificationId, true, t('staticSite_configUpdateSuccess'));
      } else {
        const errorMessage = getErrorMessageOrStringify(environmentSettingsResponse.metadata.error);
        LogService.error(
          LogCategories.staticSiteConfiguration,
          'saveEnvironmentSettings',
          `Failed to save environment settings: ${errorMessage}`
        );
        portalContext.stopNotification(notificationId, false, t('staticSite_configUpdateFailure').format(errorMessage));
      }
      setInitialLoading(false);
    }
  };

  const generateForm = (environments?: ArmObj<Environment>[], basicAuth?: PasswordProtectionTypes) => {
    setConfigurationFormData(configurationFormBuilder.generateFormData(environments, basicAuth));
    setCodeFormValidationSchema(configurationFormBuilder.generateYupValidationSchema());

    portalContext.log(
      getTelemetryInfo('info', 'generateForm', 'generated', {
        publishType: 'code',
      })
    );
  };

  const fetchDataOnEnvironmentChange = async (environmentResourceId: string) => {
    setApiFailure(false);
    fetchEnvironmentVariables(environmentResourceId);
  };

  const refresh = async () => {
    setIsRefreshing(true);
    await fetchData();
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
        saveEnvironmentVariables={saveEnvironmentVariables}
        refresh={refresh}
        isLoading={initialLoading}
        hasWritePermissions={hasWritePermissions}
        apiFailure={apiFailure}
      />
    </ConfigurationContext.Provider>
  );
};

export default ConfigurationDataLoader;
