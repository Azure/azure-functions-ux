import { StackProps } from '../../WindowsStacks/WindowsStacks';
import DropdownNoFormik from '../../../../../../components/form-controls/DropDownnoFormik';
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FunctionAppStacksContext, PermissionsContext } from '../../../Contexts';
import { FunctionAppStack } from '../../../../../../models/stacks/function-app-stacks';
import { CommonConstants, WorkerRuntimeLanguages } from '../../../../../../utils/CommonConstants';
import { findFormAppSettingValue } from '../../../AppSettingsFormData';
import { FunctionsRuntimeVersionHelper } from '../../../../../../utils/FunctionsRuntimeVersionHelper';
import { SiteStateContext } from '../../../../../../SiteState';
import { Field } from 'formik';
import { isLinuxApp, isContainerApp } from '../../../../../../utils/arm-utils';
import { getStackVersionConfigPropertyName, getStackVersionDropdownOptions } from './FunctionAppStackSettings.data';
import Dropdown from '../../../../../../components/form-controls/DropDown';
import { AppStackOs } from '../../../../../../models/stacks/app-stacks';
import { settingsWrapper } from '../../../AppSettingsForm';
import { Links } from '../../../../../../utils/FwLinks';
import TextField from '../../../../../../components/form-controls/TextField';

const FunctionAppStackSettings: React.FC<StackProps> = props => {
  const { t } = useTranslation();
  const { initialValues, values } = props;
  const functionAppStacksContext = useContext(FunctionAppStacksContext);
  const siteStateContext = useContext(SiteStateContext);

  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const runtimeVersion =
    findFormAppSettingValue(initialValues.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion) || '';
  const runtimeMajorVersion = FunctionsRuntimeVersionHelper.getFunctionsRuntimeMajorVersion(runtimeVersion);
  const isLinux = () => !!siteStateContext.site && isLinuxApp(siteStateContext.site);

  const [runtimeStack, setRuntimeStack] = useState<string | undefined>(undefined);
  const [currentStackData, setCurrentStackData] = useState<FunctionAppStack | undefined>(undefined);
  const [initialStackVersion, setInitialStackVersion] = useState<string | undefined>(undefined);

  const getConfigProperty = (runtimeStack?: string) => {
    return getStackVersionConfigPropertyName(isLinux(), runtimeStack);
  };

  const setInitialData = () => {
    const runtimeStack = initialValues.currentlySelectedStack;
    if (runtimeStack && functionAppStacksContext.length > 0) {
      setRuntimeStack(runtimeStack);
      setInitialStackData(runtimeStack);
    }
    const stackVersionProperty = getConfigProperty(runtimeStack);
    if (initialValues.config && initialValues.config && initialValues.config.properties[stackVersionProperty]) {
      setInitialStackVersion(initialValues.config.properties[stackVersionProperty]);
    }
  };

  const setInitialStackData = (runtimeStack: string) => {
    for (const stack of functionAppStacksContext) {
      for (const majorVersion of stack.majorVersions) {
        for (const minorVersion of majorVersion.minorVersions) {
          const settings = isLinux() ? minorVersion.stackSettings.linuxRuntimeSettings : minorVersion.stackSettings.windowsRuntimeSettings;
          if (!!settings && settings.appSettingsDictionary.FUNCTIONS_WORKER_RUNTIME === runtimeStack) {
            setCurrentStackData(stack);
            return;
          }
        }
      }
    }
  };

  const isVersionDirty = () => {
    const stackVersionProperty = getConfigProperty(runtimeStack);
    return !!values.config && values.config.properties[stackVersionProperty] !== initialStackVersion;
  };

  const isWindowsContainer = () => !siteStateContext.site || (!isLinux() && isContainerApp(siteStateContext.site));

  const isMajorVersionVisible = () => {
    return runtimeStack !== WorkerRuntimeLanguages.custom;
  };

  const isDotNetApp = (runtimeStack: string) => {
    return runtimeStack === WorkerRuntimeLanguages.dotnet;
  };

  const isStackDropdownComponentVisible = () => {
    return (
      siteStateContext.site && !isContainerApp(siteStateContext.site) && runtimeStack && !isDotNetApp(runtimeStack) && currentStackData
    );
  };

  const getStackDropdownComponent = () => {
    return (
      siteStateContext.site &&
      !isContainerApp(siteStateContext.site) &&
      runtimeStack &&
      !isDotNetApp(runtimeStack) &&
      currentStackData && (
        <>
          <DropdownNoFormik
            id="function-app-stack"
            selectedKey={runtimeStack}
            disabled={true}
            onChange={() => {}}
            options={[{ key: runtimeStack, text: currentStackData.displayText }]}
            label={t('stack')}
          />
          {isMajorVersionVisible() && (
            <Field
              id="function-app-stack-major-version"
              name={`config.properties.${getConfigProperty(runtimeStack)}`}
              dirty={isVersionDirty()}
              component={Dropdown}
              disabled={disableAllControls}
              label={t('versionLabel').format(currentStackData.displayText)}
              options={getStackVersionDropdownOptions(
                currentStackData,
                runtimeMajorVersion,
                isLinux() ? AppStackOs.linux : AppStackOs.windows
              )}
            />
          )}
        </>
      )
    );
  };

  const getStartupCommandComponent = () => {
    return (
      isLinux() && (
        <Field
          id="linux-function-app-appCommandLine"
          name="config.properties.appCommandLine"
          component={TextField}
          dirty={values.config.properties.appCommandLine !== initialValues.config.properties.appCommandLine}
          disabled={disableAllControls}
          label={t('appCommandLineLabel')}
          infoBubbleMessage={t('appCommandLineLabelHelpNoLink')}
          learnMoreLink={Links.linuxContainersLearnMore}
          style={{ marginLeft: '1px', marginTop: '1px' }} // Not sure why but left border disappears without margin and for small windows the top also disappears
        />
      )
    );
  };

  useEffect(() => {
    setInitialData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  if (isWindowsContainer()) {
    return null;
  }
  return isStackDropdownComponentVisible() || isLinux() ? (
    <>
      <h3>{t('stackSettings')}</h3>
      <div className={settingsWrapper}>
        {getStackDropdownComponent()}
        {getStartupCommandComponent()}
      </div>
    </>
  ) : null;
};

export default FunctionAppStackSettings;
