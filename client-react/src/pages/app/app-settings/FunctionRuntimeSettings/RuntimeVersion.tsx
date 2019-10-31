import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormProps } from '../AppSettings.types';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';
import RuntimeVersionControl from './RuntimeVersionControl';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';

const RuntimeVersion: React.FC<AppSettingsFormProps & WithTranslation> = props => {
  const { t, asyncData } = props;
  const scenarioChecker = new ScenarioService(t);
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
        <RuntimeVersionControl {...props} />
      )}
    </>
  );
};

export default withTranslation('translation')(RuntimeVersion);
