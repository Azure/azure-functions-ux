import { StackProps } from '../../WindowsStacks/WindowsStacks';
import DropdownNoFormik from '../../../../../../components/form-controls/DropDownnoFormik';
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FunctionAppStacksContext } from '../../../Contexts';
import { FunctionAppStack } from '../../../../../../models/stacks/function-app-stacks';
import { CommonConstants } from '../../../../../../utils/CommonConstants';
import { findFormAppSettingValue } from '../../../AppSettingsFormData';
import { FunctionsRuntimeVersionHelper } from '../../../../../../utils/FunctionsRuntimeVersionHelper';
import { SiteStateContext } from '../../../../../../SiteState';
import { Field } from 'formik';
import { isLinuxApp } from '../../../../../../utils/arm-utils';
import { getStackVersionConfigPropertyForWindowsApp, getStackVersionDropdownOptions } from './FunctionAppStackSetting.data';
import Dropdown from '../../../../../../components/form-controls/DropDown';
import { AppStackOs } from '../../../../../../models/stacks/app-stacks';

const FunctionAppStackSetting: React.FC<StackProps> = props => {
  const { t } = useTranslation();
  const { values } = props;
  const functionAppStacksContext = useContext(FunctionAppStacksContext);
  const siteStateContext = useContext(SiteStateContext);

  const [runtimeStack, setRuntimeStack] = useState<string | undefined>(undefined);
  const [currentStackData, setCurrentStackData] = useState<FunctionAppStack | undefined>(undefined);
  const runtimeVersion = findFormAppSettingValue(values.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion) || '';
  const [initialStackVersion, setInitialStackVersion] = useState<string | undefined>(undefined);
  const runtimeMajorVersion = FunctionsRuntimeVersionHelper.getFunctionsRuntimeMajorVersion(runtimeVersion);

  const getConfigProperty = (latestRuntimeStack?: string) => {
    return !!siteStateContext.site && isLinuxApp(siteStateContext.site)
      ? 'linuxFxVersion'
      : getStackVersionConfigPropertyForWindowsApp(latestRuntimeStack || runtimeStack);
  };

  const setInitialData = () => {
    const runtimeStack = values.currentlySelectedStack;
    if (runtimeStack && functionAppStacksContext.length > 0) {
      setRuntimeStack(runtimeStack);
      setCurrentStackData(functionAppStacksContext.find(stack => stack.value === runtimeStack));
    }
    if (!initialStackVersion) {
      const stackVersionProperty = getConfigProperty(runtimeStack);
      if (values.config && values.config && values.config.properties[stackVersionProperty]) {
        setInitialStackVersion(values.config.properties[stackVersionProperty]);
      }
    }
  };

  const isVersionDirty = () => {
    const stackVersionProperty = getConfigProperty(runtimeStack);
    return !!values.config && values.config.properties[stackVersionProperty] !== initialStackVersion;
  };

  useEffect(() => {
    setInitialData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return !!runtimeStack && !!currentStackData ? (
    <>
      <DropdownNoFormik
        selectedKey={runtimeStack}
        disabled={true}
        onChange={() => {}}
        options={[{ key: runtimeStack, text: currentStackData.displayText }]}
        label={t('stack')}
        id="function-app-stack"
      />
      <Field
        name={`config.properties.${getConfigProperty()}`}
        dirty={isVersionDirty()}
        component={Dropdown}
        label={t('versionLabel').format(currentStackData.displayText)}
        id="function-app-stack-major-version"
        options={getStackVersionDropdownOptions(
          currentStackData,
          runtimeMajorVersion,
          !!siteStateContext.site && isLinuxApp(siteStateContext.site) ? AppStackOs.linux : AppStackOs.windows
        )}
      />
    </>
  ) : null;
};

export default FunctionAppStackSetting;
