import { StackProps } from '../../WindowsStacks/WindowsStacks';
import DropdownNoFormik from '../../../../../../components/form-controls/DropDownnoFormik';
import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { FunctionAppStacksContext, PermissionsContext } from '../../../Contexts';
import { FunctionAppStack } from '../../../../../../models/stacks/function-app-stacks';
import { CommonConstants, WorkerRuntimeLanguages } from '../../../../../../utils/CommonConstants';
import { addOrUpdateFormAppSetting, findFormAppSettingValue } from '../../../AppSettingsFormData';
import { FunctionsRuntimeVersionHelper } from '../../../../../../utils/FunctionsRuntimeVersionHelper';
import { SiteStateContext } from '../../../../../../SiteState';
import { Field } from 'formik';
import { getStackVersionDropdownOptions } from './FunctionAppStackSettings.data';
import { AppStackOs } from '../../../../../../models/stacks/app-stacks';
import { settingsWrapper } from '../../../AppSettingsForm';
import { IDropdownOption, MessageBarType } from '@fluentui/react';
import { FormAppSetting } from '../../../AppSettings.types';
import Dropdown from '../../../../../../components/form-controls/DropDown';
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
import { isFlexConsumption } from '../../../../../../utils/arm-utils';
import CustomBanner from '../../../../../../components/CustomBanner/CustomBanner';

const FunctionAppStackSettings: React.FC<StackProps> = props => {
  const { t } = useTranslation();
  const { initialValues, values, setFieldValue } = props;
  const siteStateContext = useContext(SiteStateContext);
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const functionAppStackContext = useContext(FunctionAppStacksContext);

  const disableAllControls = React.useMemo(() => !app_write || !editable || saving, [app_write, editable, saving]);
  const functionAppFilteredStacks = React.useMemo(
    () =>
      filterFunctionAppStack(
        functionAppStackContext,
        initialValues,
        siteStateContext.isLinuxApp,
        initialValues.currentlySelectedStack,
        siteStateContext.site
      ),
    [functionAppStackContext, initialValues, siteStateContext]
  );

  const [currentStackData, setCurrentStackData] = useState<FunctionAppStack | undefined>(undefined);
  const [initialStackVersion, setInitialStackVersion] = useState<string | undefined>(undefined);
  const [selectedStackVersion, setSelectedStackVersion] = useState<string | undefined>(undefined);
  const [dirtyState, setDirtyState] = useState(false);

  const runtimeStack = React.useMemo(() => {
    return functionAppFilteredStacks.length > 0 ? initialValues.currentlySelectedStack : undefined;
  }, [functionAppFilteredStacks, initialValues]);

  const options = React.useMemo(() => {
    const runtimeVersion = findFormAppSettingValue(values.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion) ?? '';
    const isLinux = siteStateContext.isLinuxApp;
    const osType = isLinux ? AppStackOs.linux : AppStackOs.windows;
    const isFlexConsumptionApp = !!siteStateContext.site && isFlexConsumption(siteStateContext.site);
    const dropdownOptions = currentStackData
      ? getStackVersionDropdownOptions(
          currentStackData,
          FunctionsRuntimeVersionHelper.getFunctionsRuntimeMajorVersionWithV4(runtimeVersion),
          osType,
          isFlexConsumptionApp
        )
      : [];

    if (
      StringUtils.equalsIgnoreCase(runtimeStack, WorkerRuntimeLanguages.dotnetIsolated) ||
      StringUtils.equalsIgnoreCase(runtimeStack, WorkerRuntimeLanguages.dotnet)
    ) {
      // Disable dotnet-isolated options when the runtime stack is dotnet, vise versa
      const dropdownWithDisabledOptions = dropdownOptions.map(option => {
        const settings =
          osType === AppStackOs.windows
            ? option.data?.stackSettings?.windowsRuntimeSettings
            : option.data?.stackSettings?.linuxRuntimeSettings;
        return {
          ...option,
          disabled:
            settings?.appSettingsDictionary?.FUNCTIONS_WORKER_RUNTIME &&
            !StringUtils.equalsIgnoreCase(settings.appSettingsDictionary?.FUNCTIONS_WORKER_RUNTIME, runtimeStack),
        };
      });

      // Any duplicated and disabled dotnet/dotnet-isolated key will be assigned with a new key to prevent default selection
      const keySet = new Set<string>();
      const duplicatedDotNetKeys = new Set<string>();
      for (const option of dropdownWithDisabledOptions) {
        const key = `${option.key}`;
        if (keySet.has(key)) {
          duplicatedDotNetKeys.add(key);
        }
        keySet.add(key);
      }

      if (duplicatedDotNetKeys.size > 0) {
        return dropdownWithDisabledOptions.map(option => {
          if (duplicatedDotNetKeys.has(`${option.key}`) && option.disabled) {
            return { ...option, key: `${option.key}-disabled` };
          }
          return option;
        });
      }

      return dropdownWithDisabledOptions;
    } else {
      return dropdownOptions;
    }
  }, [values, siteStateContext, currentStackData, runtimeStack]);

  const isSettingSectionVisible = React.useMemo(
    () => siteStateContext.site && siteStateContext.isFunctionApp && !siteStateContext.isContainerApp,
    [siteStateContext.site, siteStateContext.isFunctionApp, siteStateContext.isContainerApp]
  );

  const stackErrorMessage = React.useMemo(() => {
    // Handle errors on stack
    if (!runtimeStack) {
      return t('noRuntimeStackFound');
    }
    if (!currentStackData) {
      return t('invalidStack').format(runtimeStack);
    }

    // Handle errors on version
    if (!StringUtils.equalsIgnoreCase(runtimeStack, WorkerRuntimeLanguages.custom)) {
      const selectedVersionOption = options.find(option => option.key === selectedStackVersion);
      if (!selectedVersionOption) {
        if (isWindowsNodeApp(siteStateContext.isLinuxApp, runtimeStack)) {
          return t('invalidWindowsNodeStackVersion');
        } else {
          return t('invalidNonWindowsNodeStackVersion').format(currentStackData.displayText);
        }
      }

      if (selectedVersionOption.disabled) {
        return t('disabledDotNetVersion').format(
          selectedVersionOption.text,
          runtimeStack,
          StringUtils.equalsIgnoreCase(runtimeStack, WorkerRuntimeLanguages.dotnetIsolated) ? 'dotnet' : 'dotnet-isolated'
        );
      }
    }
  }, [runtimeStack, currentStackData, selectedStackVersion, options, siteStateContext.isLinuxApp, t]);

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
      } else if (!!siteStateContext.site && isFlexConsumption(siteStateContext.site)) {
        const runtimeVersion = (option.key as string).split('|')[1];
        setFieldValue('site.properties.functionAppConfig.runtime.version', runtimeVersion);
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
    const initialStackVersion = getFunctionAppStackVersion(initialValues, isLinux, values.site, runtimeStack);
    setInitialStackVersion(initialStackVersion);

    const stackVersion = getFunctionAppStackVersion(values, isLinux, values.site, runtimeStack);
    setSelectedStackVersion(stackVersion);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteStateContext.isLinuxApp, initialValues, values, runtimeStack, setSelectedStackVersion, setInitialStackVersion]);

  return isSettingSectionVisible ? (
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
        {stackErrorMessage && <CustomBanner type={MessageBarType.warning} id={'stack-error-banner'} message={stackErrorMessage} />}
      </div>
    </>
  ) : null;
};

export default FunctionAppStackSettings;
