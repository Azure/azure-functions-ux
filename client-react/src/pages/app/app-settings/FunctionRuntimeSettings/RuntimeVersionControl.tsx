import React, { useContext, useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { FormAppSetting, AppSettingsFormProps } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import { findFormAppSettingIndex, findFormAppSettingValue } from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { IDropdownOption, MessageBarType, MessageBar } from 'office-ui-fabric-react';
import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';
import { messageBannerStyle } from '../AppSettings.styles';
import { ThemeContext } from '../../../../ThemeContext';
import { FunctionsRuntimeVersionHelper } from '../../../../utils/FunctionsRuntimeVersionHelper';

interface ControlInputs {
  disableControl: boolean;
  versionOptions: IDropdownOption[];
  placeHolder: string;
  existingFunctionsWarning: string;
}

const RuntimeVersionControl: React.FC<AppSettingsFormProps & WithTranslation> = props => {
  const [latestCustomRuntimeVersion, setLatestCustomRuntimeVersion] = useState<string | null | undefined>(undefined);
  const { t, values, initialValues, asyncData, setFieldValue } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);
  const disableAllControls = !app_write || !editable || saving;

  const getControl = (): ControlInputs => {
    // If the app has functions, we need to prevent the user from changing the runtime version to a different major version.
    let versionRestriction: RuntimeExtensionMajorVersions | null = null;
    let [hasFunctions, failedToGetFunctions] = [false, false];

    // If we're waiting on an API call to determine the function count or current running version, disable the control.
    let waitingOnApi = false;

    // We only care about preventing the user from switching major versions if they have a runtime version is configured.
    // If no runtime version is configured, the runtime will not be started, so there is no current running major version.
    if (!!initialRuntimeVersion) {
      switch (asyncData.functionsCount.loadingState) {
        case 'loading':
          // The functions call hasn't completed, so we don't know the functions count. Keep the control disabled until the call completes or fails.
          waitingOnApi = true;
          break;
        case 'complete':
          // The functions call completed successfully. If the function count > 0 , prevent the user from changing major versions.
          hasFunctions = !!asyncData.functionsCount.value;
          break;
        case 'failed':
          // The functions call failed, so we don't know the functions count. To be safe, prevent the user from changing major versions.
          failedToGetFunctions = true;
          break;
      }
    }

    const versionRestrictionNeeded = hasFunctions || failedToGetFunctions;
    if (!waitingOnApi && versionRestrictionNeeded) {
      // We need to restict the user to the major version that's currently running.

      if (initialRuntimeMajorVersion === RuntimeExtensionMajorVersions.custom) {
        // The configured version is a custom value, so we need to restrict the user to the current running version and 'custom'.
        // We need to check the host status call to get the exact running version.

        if (asyncData.functionsHostStatus.loadingState === 'loading') {
          // The host status call hasn't completed yet, so we don't know the exact running version.
          // Keep the control disabled until the call completes or fails.
          waitingOnApi = true;
        } else {
          // The host status call either completed or failed.

          if (asyncData.functionsHostStatus.loadingState === 'complete') {
            // Try to get the current running major version from the result of the host status call.
            versionRestriction = FunctionsRuntimeVersionHelper.parseExactRuntimeVersion(
              asyncData.functionsHostStatus.value!.properties.version
            );
          }

          if (!versionRestriction) {
            // We weren't able to determine the major version because the host status call failed or returned a null/invalid value.
            // Try to get the intnded major version based off of the FUNCTIONS_EXTENSION_VERSION value configured
            versionRestriction = FunctionsRuntimeVersionHelper.parseConfiguredRuntimeVersion(initialRuntimeVersion);
          }
        }
      } else {
        // The configured version is not a custom value, so we can infer the current running version from this value.
        versionRestriction = initialRuntimeMajorVersion;
      }
    }

    const options: IDropdownOption[] = [
      {
        key: RuntimeExtensionMajorVersions.v1,
        text: RuntimeExtensionMajorVersions.v1,
        disabled: !!versionRestriction && versionRestriction !== RuntimeExtensionMajorVersions.v1,
      },
      {
        key: RuntimeExtensionMajorVersions.v2,
        text: RuntimeExtensionMajorVersions.v2,
        disabled: !!versionRestriction && versionRestriction !== RuntimeExtensionMajorVersions.v2,
      },
      {
        key: RuntimeExtensionMajorVersions.v3,
        text: RuntimeExtensionMajorVersions.v3,
        disabled: !!versionRestriction && versionRestriction !== RuntimeExtensionMajorVersions.v3,
      },
    ];

    if (latestCustomRuntimeVersion !== undefined || runtimeMajorVersion === RuntimeExtensionMajorVersions.custom) {
      options.unshift({
        key: RuntimeExtensionMajorVersions.custom,
        text: t('custom'),
        disabled: false,
      });
    }

    let placeHolderText = '';
    if (waitingOnApi) {
      placeHolderText = t('loading');
    } else if (failedToGetFunctions) {
      placeHolderText = t('loadingFiled');
    }

    // Disable the control if:
    //  we're waiting on an API call or
    //  we need to restrict the major version but can't determine the running version or
    //  we don't have at least two options enabled
    const multipleOptionsEnabled = options.filter(o => !o.disabled).length > 1;
    const disable = waitingOnApi || (versionRestrictionNeeded && !versionRestriction) || !multipleOptionsEnabled;

    return {
      disableControl: disable,
      versionOptions: options,
      placeHolder: placeHolderText,
      existingFunctionsWarning: hasFunctions ? t('functionsRuntimeVersionExistingFunctionsWarning') : '',
    };
  };

  const getLatestCustomRuntimeVersion = (): string | undefined => {
    return !!latestCustomRuntimeVersion ? latestCustomRuntimeVersion : initialRuntimeMajorVersion;
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

  const { disableControl, versionOptions, placeHolder, existingFunctionsWarning } = getControl();

  return (
    <>
      {!!existingFunctionsWarning && (
        <MessageBar
          id="function-app-settings-runtime-version-message"
          isMultiline={true}
          className={messageBannerStyle(theme, MessageBarType.warning)}
          messageBarType={MessageBarType.warning}>
          {existingFunctionsWarning}
        </MessageBar>
      )}
      <DropdownNoFormik
        placeHolder={placeHolder}
        value={runtimeMajorVersion}
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
