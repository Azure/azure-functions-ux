import { IDropdownOption } from '@fluentui/react';
import { Field } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown from '../../../../../../components/form-controls/DropDown';
import DropdownNoFormik from '../../../../../../components/form-controls/DropDownnoFormik';
import { AppStackOs } from '../../../../../../models/stacks/app-stacks';
import { FunctionAppStack } from '../../../../../../models/stacks/function-app-stacks';
import { SiteStateContext } from '../../../../../../SiteState';
import { CommonConstants, WorkerRuntimeLanguages } from '../../../../../../utils/CommonConstants';
import { FunctionsRuntimeVersionHelper } from '../../../../../../utils/FunctionsRuntimeVersionHelper';
import {
  checkAndGetStackEOLOrDeprecatedBanner,
  filterFunctionAppStack,
  getFunctionAppStackObject,
  getFunctionAppStackVersion,
  getStackVersionConfigPropertyName,
  isStackVersionEndOfLife,
  isWindowsNodeApp,
} from '../../../../../../utils/stacks-utils';
import StringUtils from '../../../../../../utils/string';
import { FormAppSetting } from '../../../AppSettings.types';
import { settingsWrapper } from '../../../AppSettingsForm';
import { addOrUpdateFormAppSetting, findFormAppSettingValue } from '../../../AppSettingsFormData';
import { FunctionAppStacksContext, PermissionsContext } from '../../../Contexts';
import { StackProps } from '../../WindowsStacks/WindowsStacks';
import { getStackVersionDropdownOptions } from './FunctionAppStackSettings.data';

const FunctionAppStackSettings: React.FC<StackProps> = props => {
  const { t } = useTranslation();
  const { initialValues, values, setFieldValue } = props;
  const siteStateContext = useContext(SiteStateContext);
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const functionAppStackContext = useContext(FunctionAppStacksContext);

  const disableAllControls = React.useMemo(() => !app_write || !editable || saving, [app_write, editable, saving]);
  const functionAppFilteredStacks = React.useMemo(
    () => filterFunctionAppStack(functionAppStackContext, initialValues, siteStateContext.isLinuxApp, initialValues.currentlySelectedStack),
    [functionAppStackContext, initialValues, siteStateContext]
  );

  const [currentStackData, setCurrentStackData] = useState<FunctionAppStack | undefined>(undefined);
  const [initialStackVersion, setInitialStackVersion] = useState<string | undefined>(undefined);
  const [selectedStackVersion, setSelectedStackVersion] = useState<string | undefined>(undefined);
  const [dirtyState, setDirtyState] = useState(false);

  const options = React.useMemo(() => {
    const runtimeVersion = findFormAppSettingValue(values.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion) ?? '';
    const isLinux = siteStateContext.isLinuxApp;
    const osType = isLinux ? AppStackOs.linux : AppStackOs.windows;
    return currentStackData
      ? getStackVersionDropdownOptions(
          currentStackData,
          FunctionsRuntimeVersionHelper.getFunctionsRuntimeMajorVersionWithV4(runtimeVersion),
          osType
        )
      : [];
  }, [values, siteStateContext, currentStackData]);

  const runtimeStack = React.useMemo(() => {
    return functionAppFilteredStacks.length > 0 ? initialValues.currentlySelectedStack : undefined;
  }, [functionAppFilteredStacks, initialValues]);

  const isSettingSectionVisible = React.useMemo(
    () =>
      siteStateContext.site &&
      siteStateContext.isFunctionApp &&
      !siteStateContext.isContainerApp &&
      runtimeStack &&
      (siteStateContext.isLinuxApp ||
        StringUtils.isStringInArray(
          runtimeStack,
          [WorkerRuntimeLanguages.dotnetIsolated, WorkerRuntimeLanguages.powershell, WorkerRuntimeLanguages.java],
          true
        ) ||
        initialValues.appSettings.some(appSetting =>
          StringUtils.equalsIgnoreCase(appSetting.name, CommonConstants.AppSettingNames.websiteNodeDefaultVersion)
        )),
    [siteStateContext.isLinuxApp, siteStateContext.isFunctionApp, siteStateContext.site, runtimeStack, initialValues.appSettings]
  );

  const onMajorVersionChange = React.useCallback(
    (_, option: IDropdownOption) => {
      // NOTE(krmitta): For Windows node app only we get the version from app-setting instead of config, thus this special case.
      if (isWindowsNodeApp(siteStateContext.isLinuxApp, runtimeStack)) {
        const versionData = option.data;
        if (
          versionData?.stackSettings?.windowsRuntimeSettings?.appSettingsDictionary[
            CommonConstants.AppSettingNames.websiteNodeDefaultVersion
          ]
        ) {
          let appSettings: FormAppSetting[] = [...values.appSettings];
          appSettings = addOrUpdateFormAppSetting(
            values.appSettings,
            CommonConstants.AppSettingNames.websiteNodeDefaultVersion,
            versionData.stackSettings.windowsRuntimeSettings.appSettingsDictionary[
              CommonConstants.AppSettingNames.websiteNodeDefaultVersion
            ]
          );
          setFieldValue('appSettings', appSettings);
        }
      } else {
        setFieldValue(`config.properties.${getStackVersionConfigPropertyName(siteStateContext.isLinuxApp, runtimeStack)}`, option.key);
      }
    },
    [siteStateContext.isLinuxApp, values, runtimeStack, setFieldValue]
  );

  const getEolBanner = React.useCallback(() => {
    const data = options.find(option => option.key === selectedStackVersion)?.data;
    if (data) {
      const eolDate = siteStateContext.isLinuxApp
        ? data?.stackSettings?.linuxRuntimeSettings?.endOfLifeDate
        : data?.stackSettings?.windowsRuntimeSettings?.endOfLifeDate;
      if (isStackVersionEndOfLife(eolDate)) {
        return checkAndGetStackEOLOrDeprecatedBanner(t, data?.displayText ?? '', eolDate);
      }
    }

    return null;
  }, [selectedStackVersion, options, siteStateContext, t]);

  useEffect(() => {
    setDirtyState(initialStackVersion !== selectedStackVersion);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setDirtyState, selectedStackVersion, initialStackVersion]);

  useEffect(() => {
    setCurrentStackData(getFunctionAppStackObject(functionAppFilteredStacks, siteStateContext.isLinuxApp, runtimeStack));
  }, [siteStateContext.isLinuxApp, functionAppFilteredStacks, runtimeStack, setCurrentStackData]);

  useEffect(() => {
    const isLinux = siteStateContext.isLinuxApp;
    const initialStackVersion = getFunctionAppStackVersion(initialValues, isLinux, runtimeStack);
    setInitialStackVersion(initialStackVersion);

    const stackVersion = getFunctionAppStackVersion(values, isLinux, runtimeStack);
    setSelectedStackVersion(stackVersion);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStateContext.isLinuxApp, initialValues, values, runtimeStack, setSelectedStackVersion, setInitialStackVersion]);

  return isSettingSectionVisible && currentStackData ? (
    <>
      <h3>{t('stackSettings')}</h3>
      <div className={settingsWrapper}>
        <DropdownNoFormik
          id="function-app-stack"
          selectedKey={runtimeStack}
          disabled={true}
          onChange={() => {
            /** @note (joechung): Ignore selection change since there is only a single option. */
          }}
          options={[{ key: runtimeStack ?? '', text: currentStackData?.displayText ?? '' }]}
          label={t('stack')}
        />
        {runtimeStack !== WorkerRuntimeLanguages.custom && (
          <>
            <Field
              id="function-app-stack-major-version"
              selectedKey={selectedStackVersion}
              onChange={onMajorVersionChange}
              dirty={dirtyState}
              component={Dropdown}
              disabled={disableAllControls}
              label={t('versionLabel').format(currentStackData?.displayText)}
              options={options}
            />
          </>
        )}
        {getEolBanner()}
      </div>
    </>
  ) : null;
};

export default FunctionAppStackSettings;
