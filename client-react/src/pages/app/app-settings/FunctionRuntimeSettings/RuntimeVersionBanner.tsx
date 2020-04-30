import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormProps, LoadingStates } from '../AppSettings.types';
import { findFormAppSettingValue } from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { MessageBarType } from 'office-ui-fabric-react';
import { RuntimeExtensionMajorVersions, RuntimeExtensionCustomVersions } from '../../../../models/functions/runtime-extension';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { PermissionsContext } from '../Contexts';

interface MessageBarInfo {
  messageText: string;
  messageType?: MessageBarType;
}

enum ComparisonResult {
  ExactMatch = 'ExactMatch',
  PartialMatch = 'PartialMatch',
  NoMatch = 'NoMatch',
}

const RuntimeVersionBanner: React.FC<AppSettingsFormProps & WithTranslation> = props => {
  const { t, initialValues, asyncData } = props;
  const { app_write, editable } = useContext(PermissionsContext);

  if (!app_write || !editable) {
    return null;
  }

  // Returns a warning/error message to be shown if one of the the following scenarios is true:
  //  -FUNCTIONS_EXTENSION_VERSION is missing or set to empty.
  //  -FUNCTIONS_EXTENSION_VERSION is set to 'latest' or 'beta'.
  //  -FUNCTIONS_EXTENSION_VERSION is set to a valid exact version.
  //  -FUNCTIONS_EXTENSION_VERSION is set to an invalid value.
  const getVersionMessageBar = (): MessageBarInfo => {
    switch (initialVersionToLowerTrimmed) {
      case RuntimeExtensionMajorVersions.v1:
      case RuntimeExtensionMajorVersions.v2:
      case RuntimeExtensionMajorVersions.v3:
        // FUNCTIONS_EXTENSION_VERSION is set to a valid major version, so we don't need to show any warning/error
        return { messageText: '' };
      case '':
        // FUNCTIONS_EXTENSION_VERSION is missing or set to empty, so show an error message.
        return {
          messageText: t('functionsRuntimeVersionMissingWarning'),
          messageType: MessageBarType.error,
        };
      case RuntimeExtensionCustomVersions.latest:
      case RuntimeExtensionCustomVersions.beta:
        // FUNCTIONS_EXTENSION_VERSION is set to 'latest' or 'beta', so show a warning message.
        // If we know the running version (from the host status call), include it in the warning message.
        return {
          messageText: !exactRuntimeVersion
            ? t('functionsRuntimeVersionLatestOrBetaWarning').format(initialRuntimeVersion)
            : t('functionsRuntimeVersionLatestOrBetaWithExactVersionWarning').format(initialRuntimeVersion, exactRuntimeVersion),
          messageType: MessageBarType.warning,
        };
      default:
        // FUNCTIONS_EXTENSION_VERSION is set to a non-empty value other than 'latest' or 'beta'.
        // We need to check against the running version (from the host satus call) to determine whether the value is valid.
        return getVersionMessageBarForCustom();
    }
  };

  const getVersionMessageBarForCustom = (): MessageBarInfo => {
    // We need to compare the custom runtime version against the running version (from the host satus call) to determine whether the value is valid.

    if (asyncData.functionsHostStatus.loadingState === LoadingStates.loading) {
      // The host status call hasn't completed yet, so we can't check whether the configured rutime version is valid.
      // Don't show any error/warning, and wait for the call to complete.
      return { messageText: '' };
    }

    if (!exactRuntimeVersion) {
      // The host status call failed or it completed but returned a null/empty version.
      // We can't tell whether the configured version is valid, but we show a warning.
      return {
        messageText: t('functionsRuntimeVersionMissingWarning'),
        messageType: MessageBarType.warning,
      };
    }

    // The host status call completed and we have a running version to validate against.
    // Show the appropraite warning/error based on whether the configured and running versions match.
    let messageBarInfo: MessageBarInfo = { messageText: '' };
    const comparison = compareConfiguredAndRunningVersions();
    switch (comparison) {
      case ComparisonResult.ExactMatch:
        messageBarInfo = {
          messageText: t('functionsRuntimeVersionNeedsUpdateWarning').format(exactRuntimeVersion),
          messageType: MessageBarType.warning,
        };
        break;
      case ComparisonResult.PartialMatch:
        messageBarInfo = {
          messageText: t('functionsRuntimeVersionNeedsUpdateWarning').format(`${exactRuntimeVersion} (${initialRuntimeVersion})`),
          messageType: MessageBarType.warning,
        };
        break;
      case ComparisonResult.NoMatch:
        messageBarInfo = {
          messageText: t('functionsRuntimeVersionInvalidWarning').format(initialRuntimeVersion, exactRuntimeVersion),
          messageType: MessageBarType.error,
        };
        break;
    }
    return messageBarInfo;
  };

  const compareConfiguredAndRunningVersions = (): ComparisonResult => {
    const exactVersionToLower = (exactRuntimeVersion || '').toLowerCase();

    if (initialVersionToLowerTrimmed === exactVersionToLower) {
      return ComparisonResult.ExactMatch;
    }

    // remove single leading '~', trailing '-alpha'
    const initialVersionNormalized = (initialVersionToLowerTrimmed || '').toLowerCase().replace(/^~?|(-alpha)?$/g, '');

    return !!initialVersionNormalized && exactVersionToLower.startsWith(initialVersionNormalized)
      ? ComparisonResult.PartialMatch
      : ComparisonResult.NoMatch;
  };

  const initialRuntimeVersion =
    findFormAppSettingValue(initialValues.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion) || '';

  const exactRuntimeVersion = (asyncData.functionsHostStatus.value && asyncData.functionsHostStatus.value.properties.version) || '';

  const initialVersionToLowerTrimmed = (initialRuntimeVersion || '').toLowerCase().replace(/^\s*|\s*$/g, '');

  const { messageText, messageType } = getVersionMessageBar() as { messageText: string; messageType?: MessageBarType };

  if (!messageText) {
    return null;
  }

  return (
    <CustomBanner
      id="function-app-settings-runtime-version-message"
      message={messageText}
      type={messageType || MessageBarType.info}
      undocked={true}
    />
  );
};

export default withTranslation('translation')(RuntimeVersionBanner);
