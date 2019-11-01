import React, { useContext, useState, useEffect } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { FormAppSetting, FunctionsRuntimeMajorVersions, AppSettingsFormProps } from '../AppSettings.types';
import { PermissionsContext, BannerMessageContext } from '../Contexts';
import { findFormAppSetting, findFormAppSettingIndex } from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';
import InfoBox from '../../../../components/InfoBox/InfoBox';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { IDropdownOption, MessageBarType } from 'office-ui-fabric-react';

/*

!write_app


!exactRuntimeVersion && !runtimeVersion
	Banner: '{0}' application setting is missing from your app. Without this setting you will always be running the latest version of the runtime even across major version updates which might contain breaking changes. It is advised to set that value to a specific major version (e.g. ~2) and you will get notified with newer versions for update.
	Current Runtime Version: Loading... | Failed to load.

!exactRuntimeVersion && !!runtimeVersion && isValid
	Banner: ''
	Current Runtime Version: Loading... | Failed to load.

!exactRuntimeVersion && !!runtimeVersion && !isValid -> Can't determine this?
	Banner: Your custom runtime version ({0}) is not supported. As a result the latest runtime version is being used.
	Current Runtime Version: Loading... | Failed to load.


!!exactRuntimeVersion && !runtimeVersion
	Banner: '{0}' application setting is missing from your app. Without this setting you will always be running the latest version of the runtime even across major version updates which might contain breaking changes. It is advised to set that value to a specific major version (e.g. ~2) and you will get notified with newer versions for update.
	Current Runtime Version: Loading... | {exactRuntimeVersion}

!!exactRuntimeVersion && !!runtimeVersion && isValid && !needsUpdate
	Banner: ''
	Current Runtime Version: Loading... | {exactRuntimeVersion}

!!exactRuntimeVersion && !!runtimeVersion && isValid && needsUpdate
	Banner: You are currently pinned to runtime version: {{exactExtensionVersion}}. You may update to unpin and use the latest: ({{latestExtensionVersion}}).
	Current Runtime Version: Loading... | {exactRuntimeVersion}

!!exactRuntimeVersion && !!runtimeVersion && !isValid
	Banner: Your custom runtime version ({0}) is not supported. As a result the latest runtime version ({1}) is being used.
  Current Runtime Version: Loading... | {exactRuntimeVersion}


  hasFunctions
  waiting -> [disable, all options enabled, LOADING]
  completed && 0 -> [enable, all options enabled, NO_PLACEHOLDER]
  failed || (completed) && > 0) -> disableForVersion()
      configuredRuntimeVersion
        !custom -> [enable, only one option enabled, NO_PLACEHOLDER]
        custom ->
          exactRuntimeVersion ->
            waiting -> [disable, all options enabled, LOADING]
            completed -> [enable, only one option enabled, NO_PLACEHOLDER]
            failed -> [disable, all options enabled, FAILED]


*/

const getFunctionsRuntimeMajorVersion = (version: string | null) => {
  switch (version) {
    case FunctionsRuntimeMajorVersions.v1:
      return FunctionsRuntimeMajorVersions.v1;
    case FunctionsRuntimeMajorVersions.v2:
      return FunctionsRuntimeMajorVersions.v2;
    case FunctionsRuntimeMajorVersions.v3:
      return FunctionsRuntimeMajorVersions.v3;
    default:
      return FunctionsRuntimeMajorVersions.custom;
  }
};

const parseExactRuntimeVersion = (exactRuntimeVersion: string) => {
  if (exactRuntimeVersion.startsWith('1.')) {
    return FunctionsRuntimeMajorVersions.v1;
  }

  if (exactRuntimeVersion.startsWith('2.')) {
    return FunctionsRuntimeMajorVersions.v2;
  }

  if (exactRuntimeVersion.startsWith('3.')) {
    return FunctionsRuntimeMajorVersions.v3;
  }

  return FunctionsRuntimeMajorVersions.v3;
};

const getRuntimeVersion = (appSettings: FormAppSetting[]) => {
  const appSetting = findFormAppSetting(appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);
  return appSetting && appSetting.value;
};

const RuntimeVersionControl: React.FC<AppSettingsFormProps & WithTranslation> = props => {
  useEffect(() => {
    if (bannerMessage) {
      bannerMessageContext.updateBanner({
        type: MessageBarType.info,
        text: bannerMessage,
      });
    } else {
      bannerMessageContext.updateBanner();
    }
  }, []);
  const bannerMessageContext = useContext(BannerMessageContext);
  const [latestCustomRuntimeVersion, setLatestCustomRuntimeVersion] = useState<string | null | undefined>(undefined);
  const { t, values, initialValues, asyncData, setFieldValue } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);

  const doStuff = () => {
    if (asyncData.functionsCount.loadingState === 'loading') {
      return { forcedDisable: true, versionFilter: null, placeHolder: t('loading') };
    }

    if (asyncData.functionsCount.value === 0) {
      return { forcedDisable: false, versionFilter: null, placeHolder: '' };
    }

    if (initialRuntimeMajorVersion !== FunctionsRuntimeMajorVersions.custom) {
      return { forcedDisable: false, versionFilter: initialRuntimeMajorVersion, placeHolder: '' };
    }

    if (asyncData.functionsHostStatus.loadingState === 'loading') {
      return { forcedDisable: true, filversionFilterter: null, placeHolder: t('loading') };
    }

    if (asyncData.functionsHostStatus.loadingState === 'complete') {
      return {
        forcedDisable: false,
        versionFilter: parseExactRuntimeVersion(asyncData.functionsHostStatus.value!.properties.version),
        placeHolder: '',
      };
    }

    // if (asyncData.functionsHostStatus.loadingState === 'failed') {
    return { forcedDisable: true, versionFilter: null, placeHolder: t('failed') };
    // }
  };

  const getOptions = () => {
    const options: IDropdownOption[] = [
      {
        key: FunctionsRuntimeMajorVersions.v1,
        text: t('~1'),
        disabled: !!versionFilter && versionFilter !== FunctionsRuntimeMajorVersions.v1,
      },
      {
        key: FunctionsRuntimeMajorVersions.v2,
        text: t('~2'),
        disabled: !!versionFilter && versionFilter !== FunctionsRuntimeMajorVersions.v2,
      },
      {
        key: FunctionsRuntimeMajorVersions.v3,
        text: t('version3Preview'),
        disabled: !!versionFilter && versionFilter !== FunctionsRuntimeMajorVersions.v3,
      },
    ];

    if (latestCustomRuntimeVersion !== undefined || runtimeMajorVersion === FunctionsRuntimeMajorVersions.custom) {
      // We need to show the 'custom' option.
      options.unshift({
        key: FunctionsRuntimeMajorVersions.custom,
        text: t('custom'),
        disabled: false,
      });
    }

    return options;
  };

  const getLatestCustomRuntimeVersion = () => {
    return latestCustomRuntimeVersion !== undefined ? latestCustomRuntimeVersion : initialRuntimeMajorVersion;
  };

  const onDropDownChange = newVersion => {
    if (runtimeMajorVersion === FunctionsRuntimeMajorVersions.custom) {
      setLatestCustomRuntimeVersion(runtimeVersion);
    }

    const version = newVersion === FunctionsRuntimeMajorVersions.custom ? getLatestCustomRuntimeVersion() : newVersion;
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

  const functionsHostStatus = asyncData.functionsHostStatus.value;
  const exactRuntimeVersion = functionsHostStatus && functionsHostStatus.properties.version;
  // const exactRuntimeGeneration = getFunctionsRuntimeGeneration(exactRuntimeVersion);

  // const hasFunctions = asyncData.functionsCount.value === undefined ? undefined : !!asyncData.functionsCount.value;

  const runtimeVersion = getRuntimeVersion(values.appSettings);
  const initialRuntimeVersion = getRuntimeVersion(initialValues.appSettings);

  const runtimeMajorVersion = getFunctionsRuntimeMajorVersion(runtimeVersion);
  const initialRuntimeMajorVersion = getFunctionsRuntimeMajorVersion(initialRuntimeVersion);

  // const disableRuntimeSelector = false;

  const { forcedDisable, versionFilter, placeHolder } = doStuff();

  if (!values.appSettings) {
    return null;
  }

  const checkConfiguredVersion = () => {
    if (!initialRuntimeVersion) {
      return {
        needToUpdateVersion: false,
        latestVersion: FunctionsRuntimeMajorVersions.v3,
        badRuntimeVersion: false,
      };
    }

    if (
      initialRuntimeVersion === FunctionsRuntimeMajorVersions.v1 ||
      initialRuntimeVersion === FunctionsRuntimeMajorVersions.v2 ||
      initialRuntimeVersion === FunctionsRuntimeMajorVersions.v3
    ) {
      return {
        needToUpdateVersion: false,
        latestVersion: initialRuntimeVersion,
        badRuntimeVersion: false,
      };
    }

    let majorVersion = FunctionsRuntimeMajorVersions.v3;
    if (initialRuntimeVersion.startsWith('1.')) {
      majorVersion = FunctionsRuntimeMajorVersions.v1;
    }
    if (initialRuntimeVersion.startsWith('2.')) {
      majorVersion = FunctionsRuntimeMajorVersions.v2;
    }
    if (initialRuntimeVersion.startsWith('3.')) {
      majorVersion = FunctionsRuntimeMajorVersions.v3;
    }

    return {
      needToUpdateVersion: true,
      latestVersion: majorVersion,
      badRuntimeVersion: !!exactRuntimeVersion && initialRuntimeVersion !== exactRuntimeVersion.replace(/.0$/, '-alpha'),
    };
  };

  const { needToUpdateVersion, badRuntimeVersion, latestVersion } = checkConfiguredVersion();

  const bannerMessage =
    !needToUpdateVersion && !badRuntimeVersion
      ? latestVersion && exactRuntimeVersion
        ? t('appFunctionSettings_functionAppSettings2')
        : t('appFunctionSettings_functionAppSettings_versionLoading')
      : needToUpdateVersion && !badRuntimeVersion
      ? latestVersion && exactRuntimeVersion
        ? t('appFunctionSettings_functionAppSettings1')
        : t('appFunctionSettings_functionAppSettings_versionLoading')
      : badRuntimeVersion
      ? t('appFunctionSettings_functionAppSettings_badVersion')
      : undefined;

  return (
    <>
      {/* <div>FunctionsCount - Loading State: {asyncData.functionsCount.loadingState}</div>
      <div>FunctionsHostStatus - LoadingState: {asyncData.functionsHostStatus.loadingState}</div>
      <br /> */}
      <DropdownNoFormik
        placeHolder={placeHolder}
        value={runtimeMajorVersion}
        dirty={runtimeMajorVersion !== initialRuntimeMajorVersion}
        onChange={(event, option) => onDropDownChange(option.key)}
        options={getOptions()}
        disabled={!app_write || !editable || saving || forcedDisable}
        label={t('runtimeVersion')}
        id="function-app-settings-runtime-version"
        infoBubbleMessage={bannerMessage}
        infoBubblePositon={'above'}
      />
      {!forcedDisable && runtimeMajorVersion === FunctionsRuntimeMajorVersions.custom && (
        <InfoBox
          id="function-app-settings-custom-runtime-version-info"
          type="Info"
          message={t('The runtime version is controlled by the FUNCTIONS_EXTENSION_VERSION app setting.')}
        />
      )}
    </>
  );
};

export default withTranslation('translation')(RuntimeVersionControl);

/*

loading: 



*/
