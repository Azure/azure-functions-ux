import { Dropdown, Icon, IDropdownOption, Link, registerIcons, ResponsiveMode } from '@fluentui/react';
import { Formik, FormikProps } from 'formik';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ActionBar from '../../../../components/ActionBar';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';
import { ReactComponent as TerminalIconSvg } from '../../../../images/Functions/terminal.svg';
import { ReactComponent as VisualStudioIconSvg } from '../../../../images/Functions/visual_studio.svg';
import { ReactComponent as VSCodeIconSvg } from '../../../../images/Functions/vs_code.svg';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionTemplate } from '../../../../models/functions/function-template';
import { HostStatus } from '../../../../models/functions/host-status';
import { PortalContext } from '../../../../PortalContext';
import { SiteStateContext } from '../../../../SiteState';
import { isElastic, isKubeApp, isLinuxApp } from '../../../../utils/arm-utils';
import { IArmResourceTemplate } from '../../../../utils/ArmTemplateHelper';
import { CommonConstants, WorkerRuntimeLanguages } from '../../../../utils/CommonConstants';
import { Links } from '../../../../utils/FwLinks';
import { LogCategories } from '../../../../utils/LogCategories';
import SiteHelper from '../../../../utils/SiteHelper';
import Url from '../../../../utils/url';
import { CreateFunctionFormBuilder, CreateFunctionFormValues } from '../common/CreateFunctionFormBuilder';
import { getTelemetryInfo } from '../common/FunctionsUtility';
import { useAppSettingsQuery } from '../common/useAppSettingsQuery';
import {
  containerStyle,
  developInPortalIconStyle,
  developmentEnvironmentStyle,
  dropdownIconStyle,
  formContainerDivStyle,
  formContainerStyle,
  selectDevelopmentEnvironmentDescriptionStyle,
  selectDevelopmentEnvironmentHeaderStyle,
} from './FunctionCreate.styles';
import { DevelopmentExperience } from './FunctionCreate.types';
import { FunctionCreateContext, IFunctionCreateContext } from './FunctionCreateContext';
import LocalCreateInstructions from './local-create/LocalCreateInstructions';
import FormContainer from './portal-create-v2/FormContainer';
import TemplateList from './portal-create/TemplateList';
import { useCreateFunction } from './useCreateFunction';
import { useProgrammingModel } from './useProgrammingModel';

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

const FunctionCreateDataLoader: React.FC<FunctionCreateDataLoaderProps> = ({ resourceId }: FunctionCreateDataLoaderProps) => {
  const siteStateContext = useContext(SiteStateContext);
  const site = useMemo(() => siteStateContext.site, [siteStateContext]);
  const portalCommunicator = useContext(PortalContext);
  const { t } = useTranslation();

  const [initialFormValues, setInitialFormValues] = useState<CreateFunctionFormValues>();
  const [templateDetailFormBuilder, setTemplateDetailFormBuilder] = useState<CreateFunctionFormBuilder>();
  const [selectedDropdownKey, setSelectedDropdownKey] = useState<DevelopmentExperience>();
  const [selectedTemplate, setSelectedTemplate] = useState<FunctionTemplate>();
  const [templates, setTemplates] = useState<FunctionTemplate[] | null>();
  const [hostStatus, setHostStatus] = useState<ArmObj<HostStatus>>();
  const [creatingFunction, setCreatingFunction] = useState(false);
  const [armResources, setArmResources] = useState<IArmResourceTemplate[]>([]);

  const {
    onProgrammingModelChange,
    onProgrammingModelRenderLabel,
    programmingModel,
    programmingModelDisabled,
    programmingModelDropdownStyles,
    programmingModelOptions,
    programmingModelVisible,
  } = useProgrammingModel(resourceId);

  const { appSettings } = useAppSettingsQuery(resourceId);

  const workerRuntime = useMemo<string>(() => {
    return appSettings?.[CommonConstants.AppSettingNames.functionsWorkerRuntime]?.toLowerCase();
  }, [appSettings]);

  const { createExperienceStatusMessage, createFunction } = useCreateFunction(
    appSettings,
    armResources,
    resourceId,
    setCreatingFunction,
    hostStatus,
    selectedTemplate
  );

  const onDevelopmentEnvironmentChange = useCallback(
    (_: React.FormEvent<HTMLElement>, option: IDropdownOption) => {
      setSelectedTemplate(undefined);
      setTemplateDetailFormBuilder(undefined);

      const key = option.key as DevelopmentExperience;

      // Log if option changed from DevelopInPortal Only
      if (selectedDropdownKey === DevelopmentExperience.developInPortal) {
        portalCommunicator.log(
          getTelemetryInfo('info', LogCategories.localDevExperience, 'FunctionCreateOptionChanged', {
            resourceId,
            sessionId: Url.getParameterByName(null, 'sessionId') ?? undefined,
            optionSelected: key,
          })
        );
      }
      setSelectedDropdownKey(key);
    },
    [portalCommunicator, resourceId, selectedDropdownKey]
  );

  const vsDropdownOption = useMemo<IDropdownOption>(() => {
    return {
      key: DevelopmentExperience.visualStudio,
      text: t('vsCardTitle'),
      data: {
        icon: <Icon iconName="visual-studio" />,
        visible: !!site && !isLinuxApp(site) && workerRuntime === WorkerRuntimeLanguages.dotnet,
      },
    };
  }, [t, site, workerRuntime]);

  const vsCodeDropdownOption = useMemo<IDropdownOption>(() => {
    return {
      key: DevelopmentExperience.visualStudioCode,
      text: t('vscodeCardTitle'),
      data: {
        icon: <Icon iconName="vs-code" />,
        visible: workerRuntime === WorkerRuntimeLanguages.java || (site && (!isLinuxApp(site) || !isElastic(site))),
      },
    };
  }, [t, site, workerRuntime]);

  const mavenDropdownOption = useMemo<IDropdownOption>(() => {
    return {
      key: DevelopmentExperience.maven,
      text: t('mavenCardTitle'),
      data: {
        icon: <Icon iconName="terminal" />,
        visible: workerRuntime === WorkerRuntimeLanguages.java,
      },
    };
  }, [t, workerRuntime]);

  const developInPortalDropdownOption = useMemo<IDropdownOption>(() => {
    return {
      key: DevelopmentExperience.developInPortal,
      text: t('developInPortal'),
      data: {
        icon: <Icon iconName="Globe" className={developInPortalIconStyle} />,
        visible: !!site && !SiteHelper.isFunctionAppReadOnly(siteStateContext.siteAppEditState) && !isKubeApp(site),
      },
    };
  }, [t, site, siteStateContext]);

  const coreToolsDropdownOption = useMemo<IDropdownOption>(() => {
    return {
      key: DevelopmentExperience.coreTools,
      text: t('coretoolsCardTitle'),
      data: {
        icon: <Icon iconName="terminal" />,
        visible: workerRuntime !== WorkerRuntimeLanguages.java,
      },
    };
  }, [t, workerRuntime]);

  const visibleDropdownOptions = useMemo(() => {
    return [vsDropdownOption, vsCodeDropdownOption, coreToolsDropdownOption, mavenDropdownOption, developInPortalDropdownOption].filter(
      option => option.data?.visible
    );
  }, [vsDropdownOption, vsCodeDropdownOption, coreToolsDropdownOption, mavenDropdownOption, developInPortalDropdownOption]);

  const onRenderOption = useCallback((option: IDropdownOption): JSX.Element => {
    return (
      <div>
        {option.data.icon}
        {option.text}
      </div>
    );
  }, []);

  const onRenderTitle = useCallback((selectedOptions: IDropdownOption[]): JSX.Element => {
    return (
      selectedOptions[0] && (
        <div>
          {selectedOptions[0].data.icon}
          {selectedOptions[0].text}
        </div>
      )
    );
  }, []);

  const cancel = useCallback(() => {
    portalCommunicator.closeSelf();
  }, [portalCommunicator]);

  const onSubmit = useCallback(
    (formValues?: CreateFunctionFormValues) => {
      if (formValues) {
        createFunction(formValues);
      }
    },
    [createFunction]
  );

  useEffect(() => {
    if (visibleDropdownOptions.length > 0) {
      if (visibleDropdownOptions.find(option => option.key === DevelopmentExperience.developInPortal)) {
        portalCommunicator.log(
          getTelemetryInfo('info', LogCategories.localDevExperience, 'FunctionPortalCreateDefaulted', {
            bundleWarning: String(!!hostStatus && !hostStatus.properties.version.startsWith('1') && !hostStatus.properties.extensionBundle),
            resourceId,
            sessionId: Url.getParameterByName(null, 'sessionId') ?? undefined,
            templateCount: String(templates?.length ?? 0),
          })
        );
        setSelectedDropdownKey(DevelopmentExperience.developInPortal);
      } else {
        setSelectedDropdownKey(visibleDropdownOptions[0].key as DevelopmentExperience);
      }
    }
  }, [hostStatus, portalCommunicator, resourceId, templates?.length, visibleDropdownOptions]);

  useEffect(() => {
    if (templateDetailFormBuilder) {
      setInitialFormValues(templateDetailFormBuilder.getInitialFormValues());
    }
  }, [templateDetailFormBuilder]);

  return visibleDropdownOptions.length > 0 && !!selectedDropdownKey ? (
    <FunctionCreateContext.Provider value={{ creatingFunction } as IFunctionCreateContext}>
      <div>
        <div className={containerStyle}>
          <h3 className={selectDevelopmentEnvironmentHeaderStyle}>{t('selectDevelopmentEnvironment')}</h3>
          <p className={selectDevelopmentEnvironmentDescriptionStyle}>
            {t('selectDevelopmentEnvironmentDescription')}
            <Link href={Links.functionCreateSummaryLearnMore} rel="noopener" target="_blank">
              {t('learnMore')}
            </Link>
          </p>
          <DropdownNoFormik
            label={t('developmentEnvironment')}
            id="function-create-development-environment"
            options={visibleDropdownOptions}
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
          {selectedDropdownKey === DevelopmentExperience.developInPortal && programmingModelVisible && (
            <Dropdown
              id="function-create-programming-model"
              aria-labelledby="programming-model-label"
              disabled={programmingModelDisabled}
              onChange={onProgrammingModelChange}
              onRenderLabel={onProgrammingModelRenderLabel}
              options={programmingModelOptions}
              responsiveMode={ResponsiveMode.large}
              selectedKey={programmingModel}
              styles={programmingModelDropdownStyles}
            />
          )}
        </div>
        {selectedDropdownKey === DevelopmentExperience.developInPortal && programmingModel === 2 ? (
          <FormContainer hostStatus={hostStatus} resourceId={resourceId} />
        ) : selectedDropdownKey === DevelopmentExperience.developInPortal ? (
          <Formik<CreateFunctionFormValues | undefined>
            initialValues={initialFormValues}
            enableReinitialize
            isInitialValid // Using deprecated option to allow pristine values to be valid.
            onSubmit={onSubmit}>
            {(formProps: FormikProps<CreateFunctionFormValues>) => (
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
                    armResources={armResources}
                    setArmResources={setArmResources}
                  />
                </div>
                <ActionBar
                  fullPageHeight
                  id="add-function-footer"
                  primaryButton={{
                    id: 'add',
                    title: t('create'),
                    onClick: formProps.submitForm,
                    disable: !initialFormValues || creatingFunction,
                  }}
                  secondaryButton={{
                    id: 'cancel',
                    title: t('cancel'),
                    onClick: cancel,
                    disable: creatingFunction,
                  }}
                  statusMessage={createExperienceStatusMessage}
                  validating={creatingFunction}
                  validationMessage={t('creatingFunction')}
                />
              </form>
            )}
          </Formik>
        ) : (
          <>
            <LocalCreateInstructions resourceId={resourceId} localDevExperience={selectedDropdownKey} workerRuntime={workerRuntime} />
            <ActionBar
              fullPageHeight
              id="add-function-footer"
              primaryButton={{
                id: 'close',
                title: t('close'),
                onClick: cancel,
                disable: false,
              }}
            />
          </>
        )}
      </div>
    </FunctionCreateContext.Provider>
  ) : null;
};

export default FunctionCreateDataLoader;
