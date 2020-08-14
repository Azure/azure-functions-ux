import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, IDropdownOption, ResponsiveMode, registerIcons, Icon } from 'office-ui-fabric-react';
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
import ActionBar from '../../../../components/ActionBar';
import TemplateList from './portal-create/TemplateList';
import { Formik, FormikProps } from 'formik';
import { CreateFunctionFormValues, CreateFunctionFormBuilder } from '../common/CreateFunctionFormBuilder';
import { DevelopmentExperience } from './FunctionCreate.types';
import { ReactComponent as VSCodeIconSvg } from '../../../../images/Functions/vs_code.svg';
import { ReactComponent as TerminalIconSvg } from '../../../../images/Functions/terminal.svg';
import { ReactComponent as VisualStudioIconSvg } from '../../../../images/Functions/visual_studio.svg';
import { SiteStateContext } from '../../../../SiteState';
import SiteService from '../../../../ApiHelpers/SiteService';
import { CommonConstants, WorkerRuntimeLanguages } from '../../../../utils/CommonConstants';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';
import { getErrorMessageOrStringify, getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { isLinuxApp, isElastic } from '../../../../utils/arm-utils';
import SiteHelper from '../../../../utils/SiteHelper';
import LocalCreateInstructions from './local-create/LocalCreateInstructions';
import { PortalContext } from '../../../../PortalContext';
import FunctionCreateData from './FunctionCreate.data';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { ArmObj } from '../../../../models/arm-obj';
import { KeyValue } from '../../../../models/portal-models';
import Url from '../../../../utils/url';
import { HostStatus } from '../../../../models/functions/host-status';

registerIcons({
  icons: {
    'vs-code': <VSCodeIconSvg className={dropdownIconStyle} />,
    'visual-studio': <VisualStudioIconSvg className={dropdownIconStyle} />,
    terminal: <TerminalIconSvg className={dropdownIconStyle} />,
  },
});

export interface FunctionCreateDataLoaderProps {
  resourceId: string;
}

const FunctionCreateDataLoader: React.SFC<FunctionCreateDataLoaderProps> = props => {
  const { resourceId } = props;

  const siteStateContext = useContext(SiteStateContext);
  const portalCommunicator = useContext(PortalContext);
  const site = siteStateContext.site;
  const { t } = useTranslation();

  const [initialFormValues, setInitialFormValues] = useState<CreateFunctionFormValues | undefined>(undefined);
  const [templateDetailFormBuilder, setTemplateDetailFormBuilder] = useState<CreateFunctionFormBuilder | undefined>(undefined);
  const [selectedDropdownKey, setSelectedDropdownKey] = useState<DevelopmentExperience | undefined>(undefined);
  const [workerRuntime, setWorkerRuntime] = useState<string | undefined>(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState<FunctionTemplate | undefined>(undefined);
  const [templates, setTemplates] = useState<FunctionTemplate[] | undefined | null>(undefined);
  const [hostStatus, setHostStatus] = useState<ArmObj<HostStatus> | undefined>(undefined);

  const onDevelopmentEnvironmentChange = (event: any, option: IDropdownOption) => {
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
    return !SiteHelper.isFunctionAppReadOnly(siteStateContext.siteAppEditState);
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
      const appSettings = appSettingsResponse.data;
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

  const updateAppSettings = async (appSettings: ArmObj<KeyValue<string>>) => {
    const notificationId = portalCommunicator.startNotification(t('configUpdating'), t('configUpdating'));
    const updateAppSettingsResponse = await FunctionCreateData.updateAppSettings(resourceId, appSettings);
    if (updateAppSettingsResponse.metadata.success) {
      portalCommunicator.stopNotification(notificationId, true, t('configUpdateSuccess'));
    } else {
      const errorMessage = getErrorMessage(updateAppSettingsResponse.metadata.error) || t('configUpdateFailure');
      portalCommunicator.stopNotification(notificationId, false, errorMessage);
      LogService.trackEvent(
        LogCategories.functionCreate,
        'updateAppSettings',
        `Failed to update Application Settings: ${getErrorMessageOrStringify(updateAppSettingsResponse.metadata.error)}`
      );
    }
  };

  const addFunction = async (formValues: CreateFunctionFormValues) => {
    if (selectedTemplate) {
      const config = FunctionCreateData.buildFunctionConfig(selectedTemplate.bindings || [], formValues);
      const { functionName } = formValues;
      const { files } = selectedTemplate;
      const notificationId = portalCommunicator.startNotification(
        t('createFunctionNotication'),
        t('createFunctionNotificationDetails').format(functionName)
      );

      LogService.trackEvent(
        LogCategories.localDevExperience,
        'FunctionCreateClicked',
        FunctionCreateData.getDataForTelemetry(resourceId, functionName, selectedTemplate, hostStatus)
      );
      const createFunctionResponse = await FunctionCreateData.createFunction(resourceId, functionName, files, config);
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
          LogCategories.functionCreate,
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
      if (formValues.newAppSettings) {
        updateAppSettings(formValues.newAppSettings);
      } else {
        addFunction(formValues);
      }
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
            title: t('add'),
            onClick: formProps.submitForm,
            disable: !initialFormValues,
          };

          const actionBarSecondaryButtonProps = {
            id: 'cancel',
            title: t('cancel'),
            onClick: cancel,
            disable: false,
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
                  hostStatus={hostStatus}
                  setHostStatus={setHostStatus}
                />
              </div>
              <ActionBar
                fullPageHeight={true}
                id="add-function-footer"
                primaryButton={actionBarPrimaryButtonProps}
                secondaryButton={actionBarSecondaryButtonProps}
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
    <div>
      <div className={containerStyle}>
        <h3 className={selectDevelopmentEnvironmentHeaderStyle}>{t('selectDevelopmentEnvironment')}</h3>
        <p className={selectDevelopmentEnvironmentDescriptionStyle}>
          {t('selectDevelopmentEnvironmentDescription')}
          {/* TODO(krmitta): Add learn more link */}
          <Link>{t('learnMore')}</Link>
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
        />
      </div>
      {selectedDropdownKey === DevelopmentExperience.developInPortal ? getPortalCreateComponent() : getLocalCreateComponent()}
    </div>
  ) : null;
};

export default FunctionCreateDataLoader;
