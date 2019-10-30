import { FormikProps } from 'formik';
import React, { useContext, useEffect } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues, FormAppSetting, FunctionsRuntimeMajorVersions } from '../AppSettings.types';
import { BannerMessageContext } from '../Contexts';
import {
  findFormAppSetting,
  // getFunctionsRuntimeGeneration,
} from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import { MessageBarType } from 'office-ui-fabric-react';
// import { ThemeContext } from '../../../../ThemeContext';
// import { MessageBar } from 'office-ui-fabric-react';
// import { messageBannerStyle } from '../AppSettings.styles';

const getRuntimeVersion = (appSettings: FormAppSetting[]) => {
  const appSetting = findFormAppSetting(appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);
  return appSetting && appSetting.value;
};

const CurrentRuntimeVersion: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
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
  const { t, initialValues } = props;
  const bannerMessageContext = useContext(BannerMessageContext);

  const isStopped =
    initialValues.site.properties.state && initialValues.site.properties.state.toLocaleLowerCase() !== 'Running'.toLocaleLowerCase();

  const exactRuntimeVersion = !!initialValues.hostStatus ? initialValues.hostStatus.properties.version : null;
  // const exactRuntimeGeneration = getFunctionsRuntimeGeneration(exactRuntimeVersion);

  const initialRuntimeVersion = getRuntimeVersion(initialValues.appSettings);

  const checkConfiguredVersion = () => {
    if (!initialRuntimeVersion) {
      return {
        needToUpdateVersion: false,
        latestVersion: FunctionsRuntimeMajorVersions.v3,
        badRuntimeVersion: false,
      };
    }

    const index = FunctionsService.FunctionsVersionInfo.runtimeStable.findIndex(v => {
      return initialRuntimeVersion.toLowerCase() === v;
    });

    if (index !== -1) {
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
      : null;

  return (
    <>
      {!isStopped && (
        <ReactiveFormControl label={t('Current Runtime Version')} id="function-app-settings-exact-runtime-version">
          <div id="function-app-settings-exact-runtime-version" aria-labelledby="function-app-settings-exact-runtime-version-label">
            {exactRuntimeVersion}
          </div>
        </ReactiveFormControl>
      )}
    </>
  );
};

export default withTranslation('translation')(CurrentRuntimeVersion);
