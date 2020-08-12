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
import { getErrorMessageOrStringify } from '../../../../ApiHelpers/ArmHelper';
import { isLinuxApp, isElastic } from '../../../../utils/arm-utils';
import SiteHelper from '../../../../utils/SiteHelper';

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
  const { t } = useTranslation();

  const [initialFormValues, setInitialFormValues] = useState<CreateFunctionFormValues | undefined>(undefined);
  const [templateDetailFormBuilder, setTemplateDetailFormBuilder] = useState<CreateFunctionFormBuilder | undefined>(undefined);
  const [selectedDropdownKey, setSelectedDropdownKey] = useState<DevelopmentExperience | undefined>(undefined);
  const [workerRuntime, setWorkerRuntime] = useState<string | undefined>(undefined);

  const siteStateContext = useContext(SiteStateContext);
  const site = siteStateContext.site;

  const onDevelopmentEnvironmentChange = (event: any, option: IDropdownOption) => {
    setSelectedDropdownKey(option.key as DevelopmentExperience);
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
    // TODO (krmitta): Implement cancel
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
        setSelectedDropdownKey(DevelopmentExperience.developInPortal);
      } else {
        setSelectedDropdownKey(options[0].key as DevelopmentExperience);
      }
    }
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
      {selectedDropdownKey === DevelopmentExperience.developInPortal && (
        <Formik
          initialValues={initialFormValues}
          enableReinitialize={true}
          isInitialValid={true} // Using deprecated option to allow pristine values to be valid.
          onSubmit={formValues => {
            // TODO (krmitta): Implement onSubmit
          }}>
          {(formProps: FormikProps<CreateFunctionFormValues>) => {
            const actionBarPrimaryButtonProps = {
              id: 'add',
              title: t('add'),
              onClick: formProps.submitForm,
              disable: false,
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
      )}
    </div>
  ) : null;
};

export default FunctionCreateDataLoader;
