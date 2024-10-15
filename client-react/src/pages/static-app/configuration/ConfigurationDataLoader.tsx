import { sortBy } from 'lodash-es';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessageOrStringify } from '../../../ApiHelpers/ArmHelper';
import EnvironmentService from '../../../ApiHelpers/static-site/EnvironmentService';
import StaticSiteService from '../../../ApiHelpers/static-site/StaticSiteService';
import { PortalContext } from '../../../PortalContext';
import { ArmObj } from '../../../models/arm-obj';
import { KeyValue } from '../../../models/portal-models';
import { Environment } from '../../../models/static-site/environment';
import { LogCategories } from '../../../utils/LogCategories';
import { usePortalLogging } from '../../../utils/hooks/usePortalLogging';
import RbacConstants from '../../../utils/rbac-constants';
import { getTelemetryInfo, stringToPasswordProtectionType } from '../StaticSiteUtility';
import ConfigurationData from './Configuration.data';
import {
  ConfigurationDataLoaderProps,
  ConfigurationFormData,
  ConfigurationYupValidationSchemaType,
  EnvironmentVariable,
  PasswordProtectionTypes,
  Snippet,
  StagingEnvironmentPolicyTypes,
  StaticSiteSku,
} from './Configuration.types';
import ConfigurationForm from './ConfigurationForm';
import { ConfigurationFormBuilder } from './ConfigurationFormBuilder';

const configurationData = new ConfigurationData();

export const ConfigurationContext = createContext(configurationData);

const ConfigurationDataLoader: React.FC<ConfigurationDataLoaderProps> = (props: ConfigurationDataLoaderProps) => {
  const { resourceId } = props;

  const [initialLoading, setInitialLoading] = useState(false);
  const [environments, setEnvironments] = useState<ArmObj<Environment>[]>([]);
  const [selectedEnvironmentVariableResponse, setSelectedEnvironmentVariableResponse] = useState<ArmObj<KeyValue<string>>>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasWritePermissions, setHasWritePermissions] = useState(true);
  const [apiFailure, setApiFailure] = useState(false);
  const [configurationFormData, setConfigurationFormData] = useState<ConfigurationFormData>();
  const [codeFormValidationSchema, setCodeFormValidationSchema] = useState<ConfigurationYupValidationSchemaType>();
  const [staticSiteSku, setStaticSiteSku] = useState(StaticSiteSku.Standard);
  const [location, setLocation] = useState<string>();

  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const log = usePortalLogging();

  const fetchEnvironmentVariables = useCallback(
    async (environmentResourceId: string) => {
      setInitialLoading(true);
      const environmentSettingsResponse = await EnvironmentService.fetchEnvironmentSettings(environmentResourceId);
      if (environmentSettingsResponse.metadata.success) {
        setSelectedEnvironmentVariableResponse(environmentSettingsResponse.data);
      } else {
        setApiFailure(true);
        log(
          getTelemetryInfo('error', LogCategories.staticSiteConfiguration, 'fetchEnvironmentSettings', {
            message: `Failed to fetch environment settings: ${getErrorMessageOrStringify(environmentSettingsResponse.metadata.error)}`,
          })
        );
      }
      setInitialLoading(false);
      return environmentSettingsResponse.data;
    },
    [log]
  );

  const getDefaultEnvironment = useCallback((environments: ArmObj<Environment>[]) => {
    return environments[0];
  }, []);

  const getInitialEnvironmentVariables = useCallback((selectedEnvironmentVariablesResponse?: ArmObj<KeyValue<string>>) => {
    if (selectedEnvironmentVariablesResponse) {
      return sortBy(ConfigurationData.convertEnvironmentVariablesObjectToArray(selectedEnvironmentVariablesResponse.properties), e =>
        e.name.toLocaleLowerCase()
      );
    } else {
      return [];
    }
  }, []);

  const generateForm = useCallback(
    (
      environments?: ArmObj<Environment>[],
      basicAuth?: PasswordProtectionTypes,
      defaultEnvironment?: ArmObj<Environment>,
      defaultEnvironmentVariables?: EnvironmentVariable[],
      defaultSnippets?: Snippet[],
      stagingEnvironmentPolicy?: StagingEnvironmentPolicyTypes,
      allowConfigFileUpdates?: boolean
    ) => {
      const configurationFormBuilder = new ConfigurationFormBuilder(t);
      setConfigurationFormData(
        configurationFormBuilder.generateFormData(
          environments,
          basicAuth,
          defaultEnvironment,
          defaultEnvironmentVariables,
          defaultSnippets,
          stagingEnvironmentPolicy,
          allowConfigFileUpdates
        )
      );
      setCodeFormValidationSchema(configurationFormBuilder.generateYupValidationSchema());

      portalContext.log(getTelemetryInfo('info', 'generateForm', 'generated', {}));
    },
    [portalContext, t]
  );

  const fetchData = useCallback(
    async (currentEnvironment?: ArmObj<Environment>) => {
      setInitialLoading(true);

      const appPermission = await portalContext.hasPermission(resourceId, [RbacConstants.writeScope]);
      setHasWritePermissions(appPermission);

      const [environmentResponse, staticSiteAuthResponse, staticSiteResponse, snippetsResponse] = await Promise.all([
        EnvironmentService.getEnvironments(resourceId),
        StaticSiteService.getStaticSiteBasicAuth(resourceId),
        StaticSiteService.getStaticSite(resourceId),
        StaticSiteService.getStaticSiteSnippets(resourceId),
      ]);

      let envResponse: ArmObj<Environment>[] = [];
      if (environmentResponse.metadata.success) {
        // TODO(krmitta): Handle nextlinks
        envResponse = environmentResponse.data.value;
        setEnvironments(envResponse);
      } else {
        setApiFailure(true);
        log(
          getTelemetryInfo('error', LogCategories.staticSiteConfiguration, 'getEnvironments', {
            message: `Failed to get environments: ${getErrorMessageOrStringify(environmentResponse.metadata.error)}`,
          })
        );
      }

      let passwordProtection: PasswordProtectionTypes | undefined;
      if (staticSiteAuthResponse.metadata.success) {
        passwordProtection = stringToPasswordProtectionType(staticSiteAuthResponse.data.properties.applicableEnvironmentsMode || '');
      } else {
        setApiFailure(true);
        log(
          getTelemetryInfo('error', LogCategories.staticSiteConfiguration, 'getStaticSiteBasicAuth', {
            message: `Failed to get basic auth: ${getErrorMessageOrStringify(staticSiteAuthResponse.metadata.error)}`,
          })
        );
      }

      let allowConfigFileUpdates: boolean | undefined;
      let stagingEnvironmentPolicy: StagingEnvironmentPolicyTypes | undefined;
      if (staticSiteResponse.metadata.success) {
        setStaticSiteSku(
          staticSiteResponse.data.sku?.name.toLocaleLowerCase() === StaticSiteSku.Free.toLocaleLowerCase()
            ? StaticSiteSku.Free
            : StaticSiteSku.Standard
        );
        allowConfigFileUpdates = staticSiteResponse.data.properties.allowConfigFileUpdates ?? false;
        stagingEnvironmentPolicy =
          staticSiteResponse.data.properties.stagingEnvironmentPolicy === StagingEnvironmentPolicyTypes.Disabled
            ? StagingEnvironmentPolicyTypes.Disabled
            : StagingEnvironmentPolicyTypes.Enabled;
        setLocation(staticSiteResponse.data.location);
      } else {
        setApiFailure(true);
        log(
          getTelemetryInfo('error', LogCategories.staticSiteConfiguration, 'getStaticSite', {
            message: `Failed to get site: ${getErrorMessageOrStringify(staticSiteResponse.metadata.error)}`,
          })
        );
      }
      let snippets;
      if (snippetsResponse.metadata.success) {
        snippets =
          snippetsResponse.data?.value?.map(snippet => {
            return { ...snippet?.properties, content: atob(snippet.properties.content), name: snippet?.name, checked: false };
          }) ?? [];
      }

      if (!apiFailure) {
        const defaultEnvironment = currentEnvironment ?? getDefaultEnvironment(envResponse);
        const envVarResponse = await fetchEnvironmentVariables(defaultEnvironment?.id ?? '');
        generateForm(
          envResponse,
          passwordProtection,
          defaultEnvironment,
          getInitialEnvironmentVariables(envVarResponse),
          snippets,
          stagingEnvironmentPolicy,
          allowConfigFileUpdates
        );
      }

      setInitialLoading(false);
    },
    [
      apiFailure,
      fetchEnvironmentVariables,
      generateForm,
      getDefaultEnvironment,
      getInitialEnvironmentVariables,
      log,
      portalContext,
      resourceId,
    ]
  );

  const fetchDataOnEnvironmentChange = useCallback(
    async (environmentResourceId: string) => {
      setApiFailure(false);
      await fetchEnvironmentVariables(environmentResourceId);
    },
    [fetchEnvironmentVariables]
  );

  const refresh = useCallback(
    async (currentEnvironment?: ArmObj<Environment>) => {
      setIsRefreshing(true);
      await fetchData(currentEnvironment);
      setIsRefreshing(false);
    },
    [fetchData]
  );

  useEffect(() => {
    fetchData();

    /** @note (joechung): This was originally intended to be a once-only effect. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConfigurationContext.Provider value={configurationData}>
      <ConfigurationForm
        apiFailure={apiFailure}
        environments={environments}
        fetchDataOnEnvironmentChange={fetchDataOnEnvironmentChange}
        fetchEnvironmentVariables={fetchEnvironmentVariables}
        formData={configurationFormData}
        hasWritePermissions={hasWritePermissions}
        isLoading={initialLoading}
        isRefreshing={isRefreshing}
        location={location}
        refresh={refresh}
        resourceId={resourceId}
        selectedEnvironmentVariableResponse={selectedEnvironmentVariableResponse}
        staticSiteSku={staticSiteSku}
        validationSchema={codeFormValidationSchema}
      />
    </ConfigurationContext.Provider>
  );
};

export default ConfigurationDataLoader;
