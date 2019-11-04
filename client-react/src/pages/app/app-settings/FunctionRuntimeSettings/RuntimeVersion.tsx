import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormProps } from '../AppSettings.types';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import RuntimeVersionControl from './RuntimeVersionControl';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { PermissionsContext } from '../Contexts';
import { ThemeContext } from '../../../../ThemeContext';
import { messageBannerStyle } from '../AppSettings.styles';

const RuntimeVersion: React.FC<AppSettingsFormProps & WithTranslation> = props => {
  const { t, asyncData } = props;
  const scenarioChecker = new ScenarioService(t);
  const { app_write, editable } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);
  const site = props.initialValues.site;

  const functionsHostStatus = asyncData.functionsHostStatus.value;
  const exactRuntimeVersion = functionsHostStatus && functionsHostStatus.properties.version;

  return (
    <>
      <ReactiveFormControl label={t('Current Runtime Version')} id="function-app-settings-exact-runtime-version">
        <div id="function-app-settings-exact-runtime-version" aria-labelledby="function-app-settings-exact-runtime-version-label">
          {asyncData.functionsHostStatus.loadingState === 'loading' && t('loading')}
          {asyncData.functionsHostStatus.loadingState === 'complete' && exactRuntimeVersion}
          {asyncData.functionsHostStatus.loadingState === 'failed' && t('loadingFailed')}
        </div>
      </ReactiveFormControl>
      {scenarioChecker.checkScenario(ScenarioIds.functionsRuntimeVersion, { site }).status !== 'disabled' && (
        <>
          {!app_write || !editable ? (
            <div id="function-runtime-settings-rbac-message">
              <MessageBar
                isMultiline={false}
                className={messageBannerStyle(theme, MessageBarType.warning)}
                messageBarType={MessageBarType.warning}>
                {t('readWritePermissionsRequired')}
              </MessageBar>
            </div>
          ) : (
            <RuntimeVersionControl {...props} />
          )}
        </>
      )}
    </>
  );
};

export default withTranslation('translation')(RuntimeVersion);
