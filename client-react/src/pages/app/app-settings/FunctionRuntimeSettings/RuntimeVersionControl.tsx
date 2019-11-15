import React, { useContext, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { FormAppSetting, AppSettingsFormProps } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import { findFormAppSettingIndex, findFormAppSettingValue } from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';
import RadioButtonNoFormik from '../../../../components/form-controls/RadioButtonNoFormik';
import { IChoiceGroupOption, MessageBarType, MessageBar } from 'office-ui-fabric-react';
import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';
import { messageBannerStyle } from '../AppSettings.styles';
import { ThemeContext } from '../../../../ThemeContext';
import { FunctionsRuntimeVersionHelper } from '../../../../utils/FunctionsRuntimeVersionHelper';

const RuntimeVersionControl: React.FC<AppSettingsFormProps & WithTranslation> = props => {
  const [latestCustomRuntimeVersion, setLatestCustomRuntimeVersion] = useState<string | null | undefined>(undefined);
  const { t, values, initialValues, asyncData, setFieldValue } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);
  const disableAllControls = !app_write || !editable || saving;

  const getControl = () => {
    let versionFilter: RuntimeExtensionMajorVersions | null = null;
    let disable = false;

    if (asyncData.functionsCount.loadingState === 'loading') {
      versionFilter = null;
      disable = true;
    } else if (asyncData.functionsCount.loadingState === 'complete' && asyncData.functionsCount.value === 0) {
      versionFilter = null;
      disable = false;
    } else if (initialRuntimeMajorVersion !== RuntimeExtensionMajorVersions.custom) {
      versionFilter = initialRuntimeMajorVersion;
      disable = false;
    } else if (asyncData.functionsHostStatus.loadingState === 'loading') {
      versionFilter = null;
      disable = true;
    } else if (asyncData.functionsHostStatus.loadingState === 'complete') {
      versionFilter = FunctionsRuntimeVersionHelper.parseExactRuntimeVersion(asyncData.functionsHostStatus.value!.properties.version);
      disable = false;
    } else {
      versionFilter = null;
      disable = true;
    }

    const options: IChoiceGroupOption[] = [
      {
        key: RuntimeExtensionMajorVersions.v1,
        text: t('~1'),
        disabled: !!versionFilter && versionFilter !== RuntimeExtensionMajorVersions.v1,
      },
      {
        key: RuntimeExtensionMajorVersions.v2,
        text: t('~2'),
        disabled: !!versionFilter && versionFilter !== RuntimeExtensionMajorVersions.v2,
      },
      {
        key: RuntimeExtensionMajorVersions.v3,
        text: t('version3Preview'),
        disabled: !!versionFilter && versionFilter !== RuntimeExtensionMajorVersions.v3,
      },
    ];

    if (latestCustomRuntimeVersion !== undefined || runtimeMajorVersion === RuntimeExtensionMajorVersions.custom) {
      options.unshift({
        key: RuntimeExtensionMajorVersions.custom,
        text: t('custom'),
        disabled: false,
      });
    }

    return { disableControl: disable, versionOptions: options };
  };

  const getLatestCustomRuntimeVersion = () => {
    return latestCustomRuntimeVersion !== undefined ? latestCustomRuntimeVersion : initialRuntimeMajorVersion;
  };

  const onDropDownChange = newVersion => {
    if (runtimeMajorVersion === RuntimeExtensionMajorVersions.custom) {
      setLatestCustomRuntimeVersion(runtimeVersion);
    }

    const version = newVersion === RuntimeExtensionMajorVersions.custom ? getLatestCustomRuntimeVersion() : newVersion;
    const appSettings: FormAppSetting[] = [...values.appSettings];
    const index = findFormAppSettingIndex(appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);
    if (index === -1) {
      if (version !== null) {
        appSettings.push({
          name: CommonConstants.AppSettingNames.functionsExtensionVersion,
          value: version,
          sticky: false,
        });
      }
    } else if (version !== null) {
      appSettings[index] = { ...appSettings[index], value: version };
    } else {
      appSettings.splice(index, 1);
    }
    setFieldValue('appSettings', appSettings);
  };

  const runtimeVersion = findFormAppSettingValue(values.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);
  const runtimeMajorVersion = FunctionsRuntimeVersionHelper.getFunctionsRuntimeMajorVersion(runtimeVersion);

  const initialRuntimeVersion = findFormAppSettingValue(
    initialValues.appSettings,
    CommonConstants.AppSettingNames.functionsExtensionVersion
  );
  const initialRuntimeMajorVersion = FunctionsRuntimeVersionHelper.getFunctionsRuntimeMajorVersion(initialRuntimeVersion);

  const hasFunctions =
    asyncData.functionsCount.loadingState === 'failed' ||
    (asyncData.functionsCount.loadingState === 'complete' && asyncData.functionsCount.value !== 0);

  const { disableControl, versionOptions } = getControl();

  return (
    <>
      {!!hasFunctions && (
        <MessageBar
          id="function-app-settings-runtime-version-message"
          isMultiline={true}
          className={messageBannerStyle(theme, MessageBarType.warning)}
          messageBarType={MessageBarType.warning}>
          {t('functionsRuntimeVersionExistingFunctionsWarning')}
        </MessageBar>
      )}
      <RadioButtonNoFormik
        selectedKey={runtimeMajorVersion}
        dirty={runtimeMajorVersion !== initialRuntimeMajorVersion}
        onChange={(event, option) => onDropDownChange(option ? option.key : undefined)}
        options={versionOptions}
        disabled={disableAllControls || !!disableControl}
        label={t('runtimeVersion')}
        id="function-app-settings-runtime-version"
        infoBubbleMessage={
          !disableControl && runtimeMajorVersion === RuntimeExtensionMajorVersions.custom
            ? t('functionsRuntimeVersionCustomInfo')
            : undefined
        }
      />
    </>
  );
};

export default withTranslation('translation')(RuntimeVersionControl);
