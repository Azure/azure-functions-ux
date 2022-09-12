import { StackProps } from '../../WindowsStacks/WindowsStacks';
import DropdownNoFormik from '../../../../../../components/form-controls/DropDownnoFormik';
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FunctionAppStacksContext, PermissionsContext } from '../../../Contexts';
import { FunctionAppStack } from '../../../../../../models/stacks/function-app-stacks';
import { CommonConstants, WorkerRuntimeLanguages } from '../../../../../../utils/CommonConstants';
import { addOrUpdateFormAppSetting, findFormAppSettingValue, findFormAppSettingIndex } from '../../../AppSettingsFormData';
import { FunctionsRuntimeVersionHelper } from '../../../../../../utils/FunctionsRuntimeVersionHelper';
import { SiteStateContext } from '../../../../../../SiteState';
import { Field } from 'formik';
import { getStackVersionDropdownOptions } from './FunctionAppStackSettings.data';
import { AppStackOs } from '../../../../../../models/stacks/app-stacks';
import { settingsWrapper } from '../../../AppSettingsForm';
import { IDropdownOption } from '@fluentui/react';
import { FormAppSetting } from '../../../AppSettings.types';
import Dropdown from '../../../../../../components/form-controls/DropDown';
import {
  checkAndGetStackEOLOrDeprecatedBanner,
  filterFunctionAppStack,
  getFunctionAppStackObject,
  getFunctionAppStackVersion,
  getStackVersionConfigPropertyName,
  isWindowsNodeApp,
} from '../../../../../../utils/stacks-utils';

const FunctionAppStackSettings: React.FC<StackProps> = props => {
  const { t } = useTranslation();
  const { initialValues, values } = props;
  const siteStateContext = useContext(SiteStateContext);
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const functionAppStackContext = useContext(FunctionAppStacksContext);

  const disableAllControls = React.useMemo(() => !app_write || !editable || saving, [app_write, editable, saving]);
  const functionAppFilteredStacks = React.useMemo(
    () => filterFunctionAppStack(functionAppStackContext, initialValues, siteStateContext.isLinuxApp, initialValues.currentlySelectedStack),
    [functionAppStackContext, initialValues, siteStateContext]
  );

  const [runtimeStack, setRuntimeStack] = useState<string | undefined>(undefined);
  const [currentStackData, setCurrentStackData] = useState<FunctionAppStack | undefined>(undefined);
  const [initialStackVersion, setInitialStackVersion] = useState<string | undefined>(undefined);
  const [selectedStackVersion, setSelectedStackVersion] = useState<string | undefined>(undefined);
  const [dirtyState, setDirtyState] = useState(false);
  const [eolDate, setEolDate] = useState<string | undefined>(undefined);

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

  const onMajorVersionChange = React.useCallback(
    (_, option: IDropdownOption) => {
      const selectedOptionKey = option.key as string;
      const selectedOption = options.find(option => option.key === selectedStackVersion);
      setEolDate(
        siteStateContext.isLinuxApp
          ? selectedOption?.data?.stackSettings?.linuxRuntimeSettings?.endOfLifeDate
          : selectedOption?.data?.stackSettings?.windowsRuntimeSettings?.endOfLifeDate
      );
      setSelectedStackVersion(selectedOptionKey);

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
          props.setFieldValue('appSettings', appSettings);
        }
      } else {
        props.setFieldValue(
          `config.properties.${getStackVersionConfigPropertyName(siteStateContext.isLinuxApp, runtimeStack)}`,
          option.key
        );
      }
    },
    [siteStateContext, values, runtimeStack, setSelectedStackVersion, setEolDate, options]
  );

  useEffect(() => {
    const version = getFunctionAppStackVersion(values, siteStateContext.isLinuxApp, runtimeStack);
    setSelectedStackVersion(version);

    let isDirty = false;
    // NOTE(krmitta): For Windows node app only we get the version from app-setting instead of config, thus this special case.
    if (isWindowsNodeApp(siteStateContext.isLinuxApp, runtimeStack)) {
      const index = findFormAppSettingIndex([...(values.appSettings ?? [])], CommonConstants.AppSettingNames.websiteNodeDefaultVersion);
      isDirty = index >= 0 && values.appSettings[index].value !== initialStackVersion;
    } else {
      const stackVersionProperty = getStackVersionConfigPropertyName(siteStateContext.isLinuxApp, runtimeStack);
      isDirty = values.config?.properties[stackVersionProperty] !== initialStackVersion;
    }
    setDirtyState(isDirty);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStateContext, values, runtimeStack, initialStackVersion]);

  useEffect(() => {
    const isLinux = siteStateContext.isLinuxApp;
    const runtimeStack = initialValues.currentlySelectedStack;
    if (runtimeStack && functionAppFilteredStacks.length > 0) {
      setRuntimeStack(runtimeStack);
      setCurrentStackData(getFunctionAppStackObject(functionAppFilteredStacks, isLinux, runtimeStack));
    }

    const initialStackVersion = getFunctionAppStackVersion(initialValues, isLinux, runtimeStack);
    setInitialStackVersion(initialStackVersion);
    setSelectedStackVersion(initialStackVersion);
    setDirtyState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStateContext, initialValues, functionAppFilteredStacks]);

  return currentStackData &&
    siteStateContext.site &&
    !siteStateContext.isContainerApp &&
    runtimeStack &&
    (runtimeStack !== WorkerRuntimeLanguages.dotnet || siteStateContext.isLinuxApp) ? (
    <>
      <h3>{t('stackSettings')}</h3>
      <div className={settingsWrapper}>
        <DropdownNoFormik
          id="function-app-stack"
          selectedKey={runtimeStack}
          disabled={true}
          onChange={() => {}}
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
        {checkAndGetStackEOLOrDeprecatedBanner(t, currentStackData?.displayText ?? '', eolDate)}
      </div>
    </>
  ) : null;
};

export default FunctionAppStackSettings;
