import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormProps } from '../AppSettings.types';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import RuntimeVersionControl from './RuntimeVersionControl';
import { getFunctionsRuntimeMajorVersion } from './FunctionRuntimeSettings.utils';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { PermissionsContext } from '../Contexts';
import { ThemeContext } from '../../../../ThemeContext';
import { messageBannerStyle } from '../AppSettings.styles';
import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';
import { findFormAppSettingValue } from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';

const RuntimeVersion: React.FC<AppSettingsFormProps & WithTranslation> = props => {
  const { t, initialValues, asyncData } = props;
  const scenarioChecker = new ScenarioService(t);
  const { app_write, editable } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);
  const site = props.initialValues.site;

  const getVersionToDispaly = () => {
    switch (asyncData.functionsHostStatus.loadingState) {
      case 'loading':
        return t('loading');
      case 'complete':
        return asyncData.functionsHostStatus.value && asyncData.functionsHostStatus.value.properties.version;
      case 'failed':
        return t('loadingFailed');
    }
  };

  const getInfoBox = () => {
    const initialRuntimeVersion = findFormAppSettingValue(
      initialValues.appSettings,
      CommonConstants.AppSettingNames.functionsExtensionVersion
    );
    const initialRuntimeMajorVersion = getFunctionsRuntimeMajorVersion(initialRuntimeVersion);
    const exactRuntimeVersion = asyncData.functionsHostStatus.value && asyncData.functionsHostStatus.value.properties.version;

    if (initialRuntimeMajorVersion !== RuntimeExtensionMajorVersions.custom) {
      return { message: '' };
    }

    if (!initialRuntimeVersion) {
      return {
        message: t('functionsRuntimeVersionMissingWarning'),
        type: MessageBarType.error,
      };
    }

    if (initialRuntimeVersion.toLowerCase() === 'latest' || initialRuntimeVersion.toLowerCase() === 'beta') {
      return {
        message: !exactRuntimeVersion
          ? t('functionsRuntimeVersionLatestOrBetaWarning').format(initialRuntimeVersion)
          : t('functionsRuntimeVersionLatestOrBetaWithExactVersionWarning').format(initialRuntimeVersion, exactRuntimeVersion),
        type: MessageBarType.warning,
      };
    }

    if (!exactRuntimeVersion) {
      return { message: '' };
    }

    if (
      initialRuntimeVersion.toLowerCase() === exactRuntimeVersion.toLowerCase() ||
      initialRuntimeVersion.toLowerCase() === exactRuntimeVersion.toLowerCase().replace(/.0$/, '-alpha')
    ) {
      return {
        message: t('functionsRuntimeVersionNeedsUpdateWarning').format(exactRuntimeVersion),
        type: MessageBarType.warning,
      };
    }

    return {
      message: t('functionsRuntimeVersionInvalidWarning').format(initialRuntimeVersion, exactRuntimeVersion),
      type: MessageBarType.error,
    };
  };

  const { message, type: messageType } = getInfoBox() as { message: string; type?: MessageBarType };

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
        !!message && (
          <MessageBar
            id="function-app-settings-runtime-version-message"
            isMultiline={true}
            className={messageType ? messageBannerStyle(theme, messageType) : undefined}
            messageBarType={messageType}>
            {message}
          </MessageBar>
        )
      )}
      <ReactiveFormControl label={t('currentRuntimeVersion')} id="function-app-settings-exact-runtime-version">
        <div id="function-app-settings-exact-runtime-version" aria-labelledby="function-app-settings-exact-runtime-version-label">
          {getVersionToDispaly()}
        </div>
      </ReactiveFormControl>
      {scenarioChecker.checkScenario(ScenarioIds.functionsRuntimeVersion, { site }).status !== 'disabled' && app_write && editable && (
        <RuntimeVersionControl {...props} />
      )}
    </>
  );
};

export default withTranslation('translation')(RuntimeVersion);
