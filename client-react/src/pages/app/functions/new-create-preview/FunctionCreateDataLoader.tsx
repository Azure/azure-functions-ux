import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, IDropdownOption, ResponsiveMode, registerIcons, Icon, Spinner, MessageBarType } from 'office-ui-fabric-react';
import {
  containerStyle,
  developmentEnvironmentStyle,
  selectDevelopmentEnvironmentDescriptionStyle,
  selectDevelopmentEnvironmentHeaderStyle,
  formContainerStyle,
  formContainerDivStyle,
  dropdownIconStyle,
  developInPortalIconStyle,
} from './FunctionCreate.styles';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';
import ActionBar, { StatusMessage } from '../../../../components/ActionBar';
import TemplateList from './portal-create/TemplateList';
import { Formik, FormikProps } from 'formik';
import { FunctionFormBuilder } from '../common/CreateFunctionFormBuilderFactory';
import { CreateFunctionFormValues } from '../common/CreateFunctionFormBuilder';
import { DevelopmentExperience } from './FunctionCreate.types';
import { ReactComponent as VSCodeIconSvg } from '../../../../images/Functions/vs_code.svg';
import { ReactComponent as TerminalIconSvg } from '../../../../images/Functions/terminal.svg';
import { ReactComponent as VisualStudioIconSvg } from '../../../../images/Functions/visual_studio.svg';
import { SiteStateContext } from '../../../../SiteState';
import SiteService from '../../../../ApiHelpers/SiteService';
import { CommonConstants, WorkerRuntimeLanguages } from '../../../../utils/CommonConstants';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import MakeArmCall, { getErrorMessageOrStringify, getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { isLinuxApp, isElastic, isKubeApp } from '../../../../utils/arm-utils';
import SiteHelper from '../../../../utils/SiteHelper';
import LocalCreateInstructions from './local-create/LocalCreateInstructions';
import { PortalContext } from '../../../../PortalContext';
import FunctionCreateData from './FunctionCreate.data';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { ArmObj } from '../../../../models/arm-obj';
import { KeyValue } from '../../../../models/portal-models';
import Url from '../../../../utils/url';
import { HostStatus } from '../../../../models/functions/host-status';
import { FunctionCreateContext, IFunctionCreateContext } from './FunctionCreateContext';
import { Links } from '../../../../utils/FwLinks';
import { Guid } from '../../../../utils/Guid';

registerIcons({
  icons: {
    'vs-code': <VSCodeIconSvg className={dropdownIconStyle} />,
    'visual-studio': <VisualStudioIconSvg className={dropdownIconStyle} />,
    terminal: <TerminalIconSvg className={dropdownIconStyle} />,
  },
});

export type TSetArmResources = (template: IArmRscTemplate[] | ((prevArmResources: IArmRscTemplate[]) => IArmRscTemplate[])) => void;

export interface FunctionCreateDataLoaderProps {
  resourceId: string;
}

export interface IArmRscTemplate {
  name: string;
  apiVersion: string;
  type: string;
  dependsOn?: string[];
  properties?: KeyValue<any>;
}

const FunctionCreateDataLoader: React.SFC<FunctionCreateDataLoaderProps> = props => {
  const { resourceId } = props;

  const siteStateContext = useContext(SiteStateContext);
  const portalCommunicator = useContext(PortalContext);
  const site = siteStateContext.site;
  const { t } = useTranslation();

  const [initialFormValues, setInitialFormValues] = useState<CreateFunctionFormValues | undefined>(undefined);
  const [templateDetailFormBuilder, setTemplateDetailFormBuilder] = useState<FunctionFormBuilder | undefined>(undefined);
  const [selectedDropdownKey, setSelectedDropdownKey] = useState<DevelopmentExperience | undefined>(undefined);
  const [workerRuntime, setWorkerRuntime] = useState<string | undefined>(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState<FunctionTemplate | undefined>(undefined);
  const [templates, setTemplates] = useState<FunctionTemplate[] | undefined | null>(undefined);
  const [armResources, setArmResources] = useState<IArmRscTemplate[]>([]);
  const [hostStatus, setHostStatus] = useState<ArmObj<HostStatus> | undefined>(undefined);
  const [creatingFunction, setCreatingFunction] = useState(false);
  const [createExperienceStatusMessage, setCreateExperienceStatusMessage] = useState<StatusMessage | undefined>(undefined);

  const onDevelopmentEnvironmentChange = (event: any, option: IDropdownOption) => {
    setSelectedTemplate(undefined);
    setTemplateDetailFormBuilder(undefined);

    const key = option.key as DevelopmentExperience;

    // Log if option changed from DevelopInPortal Only
    if (selectedDropdownKey === DevelopmentExperience.developInPortal) {
      LogService.trackEvent(LogCategories.localDevExperience, 'FunctionCreateOptionChanged', {
        resourceId,
        sessionId: Url.getParameterByName(null, 'sessionId'),
        optionSelected: key,
      });
    }
    setSelectedDropdownKey(key);
  };

  const isVSOptionVisible = () => {
    return !!site && !isLinuxApp(site) && workerRuntime === WorkerRuntimeLanguages.dotnet;
  };

  const isVSCodeOptionVisible = () => {
    return workerRuntime === WorkerRuntimeLanguages.java || (site && (!isLinuxApp(site) || !isElastic(site)));
  };

  const isCoreToolsOptionVisible = () => {
    return workerRuntime !== WorkerRuntimeLanguages.java;
  };

  const isMavenToolsOptionVisible = () => {
    return workerRuntime === WorkerRuntimeLanguages.java;
  };

  const isDevelopInPortalOptionVisible = () => {
    return !!site && !SiteHelper.isFunctionAppReadOnly(siteStateContext.siteAppEditState) && !isKubeApp(site);
  };

  const getVSDropdownOption = (): IDropdownOption => {
    return {
      key: DevelopmentExperience.visualStudio,
      text: t('vsCardTitle'),
      data: {
        icon: <Icon iconName="visual-studio" />,
        visible: isVSOptionVisible(),
      },
    };
  };

  const getVSCodeDropdownOption = (): IDropdownOption => {
    return {
      key: DevelopmentExperience.visualStudioCode,
      text: t('vscodeCardTitle'),
      data: {
        icon: <Icon iconName="vs-code" />,
        visible: isVSCodeOptionVisible(),
      },
    };
  };

  const getMavenDropdownOption = (): IDropdownOption => {
    return {
      key: DevelopmentExperience.maven,
      text: t('mavenCardTitle'),
      data: {
        icon: <Icon iconName="terminal" />,
        visible: isMavenToolsOptionVisible(),
      },
    };
  };

  const getDevelopInPortalDropdownOption = (): IDropdownOption => {
    return {
      key: DevelopmentExperience.developInPortal,
      text: t('developInPortal'),
      data: {
        icon: <Icon iconName="Globe" className={developInPortalIconStyle} />,
        visible: isDevelopInPortalOptionVisible(),
      },
    };
  };

  const getCoreToolsDropdownOption = (): IDropdownOption => {
    return {
      key: DevelopmentExperience.coreTools,
      text: t('coretoolsCardTitle'),
      data: {
        icon: <Icon iconName="terminal" />,
        visible: isCoreToolsOptionVisible(),
      },
    };
  };

  const getVisibleDropdownOptions = () => {
    return [
      getVSDropdownOption(),
      getVSCodeDropdownOption(),
      getCoreToolsDropdownOption(),
      getMavenDropdownOption(),
      getDevelopInPortalDropdownOption(),
    ].filter(option => option.data && option.data.visible);
  };

  const onRenderOption = (option: IDropdownOption): JSX.Element => {
    return (
      <div>
        {option.data.icon}
        {option.text}
      </div>
    );
  };

  const onRenderTitle = (selectedOptions: IDropdownOption[]): JSX.Element => {
    return selectedOptions.length > 0 ? (
      <div>
        {selectedOptions[0].data.icon}
        {selectedOptions[0].text}
      </div>
    ) : (
      <></>
    );
  };

  const cancel = () => {
    portalCommunicator.closeSelf();
  };

  const fetchData = async () => {
    const appSettingsResponse = await SiteService.fetchApplicationSettings(resourceId);
    if (appSettingsResponse.metadata.success) {
      const appSettings = appSettingsResponse.data.properties;
      if (appSettings.hasOwnProperty(CommonConstants.AppSettingNames.functionsWorkerRuntime)) {
        setWorkerRuntime(appSettings[CommonConstants.AppSettingNames.functionsWorkerRuntime].toLowerCase());
      }
    } else {
      LogService.trackEvent(
        LogCategories.functionCreate,
        'fetchAppSettings',
        `Failed to fetch Application Settings: ${getErrorMessageOrStringify(appSettingsResponse.metadata.error)}`
      );
    }
  };

  const setDefaultDropdownKey = () => {
    const options = getVisibleDropdownOptions();
    if (options.length > 0) {
      if (options.find(option => option.key === DevelopmentExperience.developInPortal)) {
        LogService.trackEvent(LogCategories.localDevExperience, 'FunctionPortalCreateDefaulted', {
          resourceId,
          sessionId: Url.getParameterByName(null, 'sessionId'),
          templateCount: !!templates ? templates.length : 0,
          bundleWarning: !!hostStatus && !hostStatus.properties.version.startsWith('1') && !hostStatus.properties.extensionBundle,
        });
        setSelectedDropdownKey(DevelopmentExperience.developInPortal);
      } else {
        setSelectedDropdownKey(options[0].key as DevelopmentExperience);
      }
    }
  };

  const createFunction = async (formValues: CreateFunctionFormValues) => {
    if (selectedTemplate) {
      if (!resourceId) {
        setCreateExperienceStatusMessage({
          level: MessageBarType.error,
          message: t('functionCreate_noResourceIdError'),
        });

        return;
      }

      setCreatingFunction(true);

      let newAppSettings = formValues.newAppSettings;
      // Handle custom app settings for CDB template
      if (formValues.connectionType && formValues.connectionType === 'manual') {
        formValues.connectionStringSetting = formValues.customAppSettingKey;

        newAppSettings = {
          properties: {
            [formValues.customAppSettingKey]: formValues.customAppSettingValue,
          },
        };
      }

      const config = FunctionCreateData.buildFunctionConfig(selectedTemplate.bindings || [], formValues);
      const { functionName } = formValues;
      const { files } = selectedTemplate;
      const deploymentName = `Microsoft.Web-Function-${Guid.newShortGuid()}`;
      const notificationId = portalCommunicator.startNotification(
        t('createFunctionNotication'),
        t('createFunctionNotificationDetails').format(functionName)
      );

      LogService.trackEvent(
        LogCategories.localDevExperience,
        'FunctionCreateClicked',
        FunctionCreateData.getDataForTelemetry(resourceId, functionName, selectedTemplate, hostStatus)
      );

      const splitRscId = resourceId.split('/');
      const functionAppId = splitRscId[splitRscId.length - 1];

      // We need to get the current appsettings to include in the
      // deployment as they get overwritten otherwise
      // TODO: Consider using SiteService to fetchApplicationSettings
      const getAppSettingsResponse = await MakeArmCall<any>({
        method: 'POST',
        resourceId: `${resourceId}/config/appsettings/list`,
        commandName: 'getFunctionAppSettings',
      });

      const currentAppSettings = getAppSettingsResponse.data.properties;

      const createFunctionResponse = await FunctionCreateData.createFunction(resourceId, functionName, files, config);

      // NOTE(nlayne): Only do deployment stuff if we have resources or new appsettings to deploy
      if (!!newAppSettings || armResources.length > 0) {
        const armDeploymentTemplate = FunctionCreateData.getDeploymentTemplate(
          armResources,
          functionAppId,
          newAppSettings,
          currentAppSettings
        );

        // Double (or maybe even triple at this point) check that we don't do a deployment w/ no resources
        if (armDeploymentTemplate.properties.template.resources.length > 0) {
          // Hand ARM deployment template to Ibiza to do deployment/notification
          const subAndRscGrpRscId = resourceId.split('/Microsoft.Web')[0];
          const rscGrp = subAndRscGrpRscId.split('resourceGroups/')[1].split('/')[0];
          portalCommunicator.executeArmUpdateRequest<any>({
            uri: `${subAndRscGrpRscId}/Microsoft.Resources/deployments/${deploymentName}?api-version=${
              CommonConstants.ApiVersions.armDeploymentApiVersion20210401
            }`,
            type: 'PUT',
            content: armDeploymentTemplate,
            notificationTitle: t('createFunctionDeploymentNotification'),
            notificationDescription: t('createFunctionDeploymentNotificationDetails').format(functionName),
            notificationSuccessDescription: t('createFunctionDeploymentNotificationSuccess').format(deploymentName, rscGrp),
            notificationFailureDescription: t('createFunctionDeploymentNotificationFailed').format(deploymentName, rscGrp),
          });
        }
      }

      if (createFunctionResponse.metadata.success) {
        LogService.trackEvent(
          LogCategories.localDevExperience,
          'FunctionCreateSucceeded',
          FunctionCreateData.getDataForTelemetry(resourceId, functionName, selectedTemplate, hostStatus)
        );
        portalCommunicator.stopNotification(notificationId, true, t('createFunctionNotificationSuccess').format(functionName));

        const id = `${resourceId}/functions/${functionName}`;
        portalCommunicator.closeSelf(id);
      } else {
        LogService.trackEvent(
          LogCategories.localDevExperience,
          'createFunction',
          `Failed to create function ${getErrorMessageOrStringify(createFunctionResponse.metadata.error)}`
        );
        const errorMessage = getErrorMessage(createFunctionResponse.metadata.error);
        portalCommunicator.stopNotification(
          notificationId,
          false,
          errorMessage
            ? t('createFunctionNotificationFailedDetails').format(functionName, errorMessage)
            : t('createFunctionNotificationFailed').format(functionName)
        );
        portalCommunicator.closeSelf();
      }
    }
  };

  const onSubmit = (formValues?: CreateFunctionFormValues) => {
    if (!!formValues) {
      createFunction(formValues);
    }
  };

  const actionBarCloseButtonProps = {
    id: 'close',
    title: t('close'),
    onClick: cancel,
    disable: false,
  };

  const getLocalCreateComponent = (): JSX.Element => {
    return (
      <>
        <LocalCreateInstructions resourceId={resourceId} localDevExperience={selectedDropdownKey} workerRuntime={workerRuntime} />
        <ActionBar fullPageHeight={true} id="add-function-footer" primaryButton={actionBarCloseButtonProps} />
      </>
    );
  };

  const getPortalCreateComponent = (): JSX.Element => {
    return (
      <Formik
        initialValues={initialFormValues}
        enableReinitialize={true}
        isInitialValid={true} // Using deprecated option to allow pristine values to be valid.
        onSubmit={onSubmit}>
        {(formProps: FormikProps<CreateFunctionFormValues>) => {
          const actionBarPrimaryButtonProps = {
            id: 'add',
            title: creatingFunction ? <Spinner /> : t('create'),
            onClick: formProps.submitForm,
            disable: !initialFormValues || creatingFunction,
          };

          const actionBarSecondaryButtonProps = {
            id: 'cancel',
            title: t('cancel'),
            onClick: cancel,
            disable: creatingFunction,
          };

          return (
            <form className={formContainerStyle}>
              <div className={formContainerDivStyle}>
                <TemplateList
                  resourceId={resourceId}
                  formProps={formProps}
                  setBuilder={setTemplateDetailFormBuilder}
                  builder={templateDetailFormBuilder}
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                  templates={templates}
                  setTemplates={setTemplates}
                  armResources={armResources}
                  setArmResources={setArmResources}
                  hostStatus={hostStatus}
                  setHostStatus={setHostStatus}
                />
              </div>
              <ActionBar
                fullPageHeight={true}
                id="add-function-footer"
                primaryButton={actionBarPrimaryButtonProps}
                secondaryButton={actionBarSecondaryButtonProps}
                statusMessage={createExperienceStatusMessage}
              />
            </form>
          );
        }}
      </Formik>
    );
  };

  useEffect(() => {
    setDefaultDropdownKey();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site, workerRuntime]);

  useEffect(() => {
    if (templateDetailFormBuilder) {
      setInitialFormValues(templateDetailFormBuilder.getInitialFormValues());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateDetailFormBuilder]);

  useEffect(() => {
    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return getVisibleDropdownOptions().length > 0 && selectedDropdownKey ? (
    <FunctionCreateContext.Provider value={{ creatingFunction } as IFunctionCreateContext}>
      <div>
        <div className={containerStyle}>
          <h3 className={selectDevelopmentEnvironmentHeaderStyle}>{t('selectDevelopmentEnvironment')}</h3>
          <p className={selectDevelopmentEnvironmentDescriptionStyle}>
            {t('selectDevelopmentEnvironmentDescription')}
            <Link href={Links.functionCreateSummaryLearnMore}>{t('learnMore')}</Link>
          </p>
          <DropdownNoFormik
            label={t('developmentEnvironment')}
            id="function-create-development-environment"
            options={getVisibleDropdownOptions()}
            onChange={onDevelopmentEnvironmentChange}
            responsiveMode={ResponsiveMode.large}
            onRenderOption={onRenderOption}
            onRenderTitle={onRenderTitle}
            customLabelClassName={developmentEnvironmentStyle}
            layout={Layout.Horizontal}
            widthOverride="80%"
            selectedKey={selectedDropdownKey}
            disabled={creatingFunction}
          />
        </div>
        {selectedDropdownKey === DevelopmentExperience.developInPortal ? getPortalCreateComponent() : getLocalCreateComponent()}
      </div>
    </FunctionCreateContext.Provider>
  ) : null;
};

export default FunctionCreateDataLoader;
