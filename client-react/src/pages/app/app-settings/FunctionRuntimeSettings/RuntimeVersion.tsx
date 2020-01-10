import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormProps, LoadingStates } from '../AppSettings.types';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import RuntimeVersionControl from './RuntimeVersionControl';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { PermissionsContext } from '../Contexts';
import { ThemeContext } from '../../../../ThemeContext';
import { messageBannerStyle } from '../AppSettings.styles';
import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';
import { findFormAppSettingValue } from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';

interface MessageBarInfo {
  messageText: string;
  messageType?: MessageBarType;
}

type ComparisonResult = 'ExactMatch' | 'PartialMatch' | 'NoMatch';

const RuntimeVersion: React.FC<AppSettingsFormProps & WithTranslation> = props => {
  const { t, initialValues, asyncData } = props;
  const { app_write, editable } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);

  const getVersionToDispaly = () => {
    switch (asyncData.functionsHostStatus.loadingState) {
      case LoadingStates.loading:
        return t('loading');
      case LoadingStates.complete:
        return asyncData.functionsHostStatus.value && asyncData.functionsHostStatus.value.properties.version;
      case LoadingStates.failed:
        return t('loadingFailed');
    }
  };

  const getBundleVersion = () => {
    const extensionBundle = asyncData.functionsHostStatus.value && asyncData.functionsHostStatus.value.properties.extensionBundle;
    return (
      extensionBundle &&
      extensionBundle.id &&
      extensionBundle.id.toLowerCase() === 'Microsoft.Azure.Functions.ExtensionBundle'.toLowerCase() &&
      extensionBundle.version
    );
  };

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
      case 'latest':
      case 'beta':
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

    if (asyncData.functionsHostStatus.loadingState === 'loading') {
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
    const comparison = compareConfiguredAndRunningVersions();
    switch (comparison) {
      case 'ExactMatch':
        return {
          messageText: t('functionsRuntimeVersionNeedsUpdateWarning').format(exactRuntimeVersion),
          messageType: MessageBarType.warning,
        };
      case 'PartialMatch':
        return {
          messageText: t('functionsRuntimeVersionNeedsUpdateWarning').format(`${exactRuntimeVersion} (${initialRuntimeVersion})`),
          messageType: MessageBarType.warning,
        };
      case 'NoMatch':
        return {
          messageText: t('functionsRuntimeVersionInvalidWarning').format(initialRuntimeVersion, exactRuntimeVersion),
          messageType: MessageBarType.error,
        };
    }
  };

  const compareConfiguredAndRunningVersions = (): ComparisonResult => {
    const exactVersionToLower = (exactRuntimeVersion || '').toLowerCase();

    if (initialVersionToLowerTrimmed === exactVersionToLower) {
      return 'ExactMatch';
    }

    // remove single leading '~', trailing '-alpha'
    const initialVersionNormalized = (initialVersionToLowerTrimmed || '').toLowerCase().replace(/^~?|(-alpha)?$/g, '');

    return !!initialVersionNormalized && exactVersionToLower.startsWith(initialVersionNormalized) ? 'PartialMatch' : 'NoMatch';
  };

  const exactRuntimeVersion = (asyncData.functionsHostStatus.value && asyncData.functionsHostStatus.value.properties.version) || '';

  const extensionBundleVersion = getBundleVersion();

  const initialRuntimeVersion =
    findFormAppSettingValue(initialValues.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion) || '';
  const initialVersionToLowerTrimmed = (initialRuntimeVersion || '').toLowerCase().replace(/^\s*|\s*$/g, '');

  const { messageText, messageType } = getVersionMessageBar() as { messageText: string; messageType?: MessageBarType };

  return (
    <>
      {!app_write || !editable ? (
        <MessageBar
          id="function-runtime-settings-rbac-message"
          isMultiline={true}
          className={messageBannerStyle(theme, MessageBarType.warning)}
          messageBarType={MessageBarType.warning}>
          {t('readWritePermissionsRequired')}
        </MessageBar>
      ) : (
        !!messageText && (
          <MessageBar
            id="function-app-settings-runtime-version-message"
            isMultiline={true}
            className={messageType ? messageBannerStyle(theme, messageType) : undefined}
            messageBarType={messageType}>
            {messageText}
          </MessageBar>
        )
      )}
      {extensionBundleVersion && (
        <ReactiveFormControl label={t('extensionBundleVersion')} id="function-app-settings-bundle-version">
          <div id="function-app-settings-bundle-version" aria-labelledby="function-app-settings-bundle-version-label">
            {extensionBundleVersion}
          </div>
        </ReactiveFormControl>
      )}
      <ReactiveFormControl label={t('currentRuntimeVersion')} id="function-app-settings-exact-runtime-version">
        <div id="function-app-settings-exact-runtime-version" aria-labelledby="function-app-settings-exact-runtime-version-label">
          {getVersionToDispaly()}
        </div>
      </ReactiveFormControl>
      {app_write && editable && <RuntimeVersionControl {...props} />}
    </>
  );
};

export default withTranslation('translation')(RuntimeVersion);
