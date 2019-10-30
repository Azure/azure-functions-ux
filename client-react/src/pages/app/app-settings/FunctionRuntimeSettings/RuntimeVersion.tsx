import { FormikProps } from 'formik';
import React, { useContext, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues, FormAppSetting, FunctionsRuntimeMajorVersions } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import {
  findFormAppSetting,
  findFormAppSettingIndex,
  // getFunctionsRuntimeGeneration,
  getFunctionsRuntimeMajorVersion,
} from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import InfoBox from '../../../../components/InfoBox/InfoBox';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { IDropdownOption /*, MessageBarType*/ } from 'office-ui-fabric-react';
// import { ThemeContext } from '../../../../ThemeContext';
// import { MessageBar } from 'office-ui-fabric-react';
// import { messageBannerStyle } from '../AppSettings.styles';

const getRuntimeVersion = (appSettings: FormAppSetting[]) => {
  const appSetting = findFormAppSetting(appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);
  return appSetting && appSetting.value;
};

const RuntimeVersion: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const [latestCustomRuntimeVersion, setLatestCustomRuntimeVersion] = useState<string | null | undefined>(undefined);
  const { t, values, initialValues, setFieldValue } = props;
  const scenarioChecker = new ScenarioService(t);
  const { app_write, editable, saving } = useContext(PermissionsContext);
  // const theme = useContext(ThemeContext);

  const isStopped =
    initialValues.site.properties.state && initialValues.site.properties.state.toLocaleLowerCase() !== 'Running'.toLocaleLowerCase();

  // const exactRuntimeGeneration = getFunctionsRuntimeGeneration(exactRuntimeVersion);

  const runtimeVersion = getRuntimeVersion(values.appSettings);
  const initialRuntimeVersion = getRuntimeVersion(initialValues.appSettings);

  const runtimeMajorVersion = getFunctionsRuntimeMajorVersion(runtimeVersion);
  const initialRuntimeMajorVersion = getFunctionsRuntimeMajorVersion(initialRuntimeVersion);

  // const disableRuntimeSelector = false;

  const options: IDropdownOption[] = [
    {
      key: FunctionsRuntimeMajorVersions.v1,
      text: t('~1'),
    },
    {
      key: FunctionsRuntimeMajorVersions.v2,
      text: t('~2'),
    },
    {
      key: FunctionsRuntimeMajorVersions.v3,
      text: t('version3Preview'),
    },
  ];

  if (latestCustomRuntimeVersion !== undefined || runtimeMajorVersion === FunctionsRuntimeMajorVersions.custom) {
    options.unshift({
      key: FunctionsRuntimeMajorVersions.custom,
      text: t('custom'),
    });
  }

  const getLatestCustomRuntimeVersion = () => {
    if (latestCustomRuntimeVersion !== undefined) {
      return latestCustomRuntimeVersion;
    }

    // if (initialRuntimeMajorVersion === FunctionsRuntimeMajorVersions.custom) {
    return initialRuntimeMajorVersion;
    // }
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

  if (!values.appSettings) {
    return null;
  }

  return (
    <>
      {!isStopped && (
        <>
          {/* {bannerMessage && (
            <MessageBar
              id="function-app-settings-runtime-version-banner"
              isMultiline={false}
              className={messageBannerStyle(theme, MessageBarType.info)}
              messageBarType={MessageBarType.info}>
              {bannerMessage}
            </MessageBar>
          )} */}
          {scenarioChecker.checkScenario(ScenarioIds.functionsRuntimeVersion, { site: props.initialValues.site }).status !== 'disabled' && (
            <>
              <DropdownNoFormik
                value={runtimeMajorVersion}
                dirty={runtimeMajorVersion !== initialRuntimeMajorVersion}
                onChange={(event, option) => onDropDownChange(option.key)}
                options={options}
                disabled={!app_write || !editable || saving}
                label={t('runtimeVersion')}
                id="function-app-settings-runtime-version"
                notificationMessage={
                  runtimeMajorVersion === FunctionsRuntimeMajorVersions.custom
                    ? t('The runtime version is controlled by the FUNCTIONS_EXTENSION_VERSION app setting.')
                    : undefined
                }
                infoBubbleMessage={
                  false && runtimeMajorVersion === FunctionsRuntimeMajorVersions.custom
                    ? t('The runtime version is controlled by the FUNCTIONS_EXTENSION_VERSION app setting.')
                    : undefined
                }
              />
              {false && runtimeMajorVersion === FunctionsRuntimeMajorVersions.custom && (
                <InfoBox
                  id="function-app-settings-custom-runtime-version-info"
                  type="Info"
                  message={t('The runtime version is controlled by the FUNCTIONS_EXTENSION_VERSION app setting.')}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default withTranslation('translation')(RuntimeVersion);
