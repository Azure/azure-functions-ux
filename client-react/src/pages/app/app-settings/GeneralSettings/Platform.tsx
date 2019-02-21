import { Field, FormikProps } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown from '../../../../components/form-controls/DropDown';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';

const Platform: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const { values } = props;
  const { site } = values;
  const { t } = useTranslation();
  const scenarioChecker = new ScenarioService(t);
  const { app_write, editable } = useContext(PermissionsContext);
  const platformOptionEnable = scenarioChecker.checkScenario(ScenarioIds.enablePlatform64, { site });
  const websocketsEnable = scenarioChecker.checkScenario(ScenarioIds.webSocketsEnabled, { site });
  const alwaysOnEnable = scenarioChecker.checkScenario(ScenarioIds.enableAlwaysOn, { site });
  return (
    <div>
      {scenarioChecker.checkScenario(ScenarioIds.platform64BitSupported, { site }).status !== 'disabled' && (
        <Field
          name="config.properties.use32BitWorkerProcess"
          component={Dropdown}
          fullpage
          upsellMessage={platformOptionEnable.data}
          label={t('platform')}
          id="app-settings-worker-process"
          disabled={!app_write || !editable || platformOptionEnable.status === 'disabled'}
          options={[
            {
              key: true,
              text: '32 Bit',
            },
            {
              key: false,
              text: '64 Bit',
            },
          ]}
        />
      )}
      {scenarioChecker.checkScenario(ScenarioIds.classicPipelineModeSupported, { site }).status !== 'disabled' && (
        <Field
          name="config.properties.managedPipelineMode"
          component={Dropdown}
          fullpage
          label={t('managedPipelineVersion')}
          id="app-settings-managed-pipeline-mode"
          disabled={!app_write || !editable}
          options={[
            {
              key: 'Integrated',
              text: t('integrated'),
            },
            {
              key: 'Classic',
              text: t('classic'),
            },
          ]}
        />
      )}
      {scenarioChecker.checkScenario(ScenarioIds.addFTPOptions, { site }).status !== 'disabled' && (
        <Field
          name="config.properties.ftpsState"
          component={Dropdown}
          fullpage
          label={t('ftpState')}
          id="app-settings-ftps-state"
          disabled={!app_write || !editable}
          options={[
            {
              key: 'AllAllowed',
              text: t('allAllowed'),
            },
            {
              key: 'FtpsOnly',
              text: t('ftpsOnly'),
            },
            {
              key: 'Disabled',
              text: t('disabled'),
            },
          ]}
        />
      )}
      {scenarioChecker.checkScenario(ScenarioIds.addHTTPSwitch, { site }).status !== 'disabled' && (
        <Field
          name="config.properties.http20Enabled"
          component={Dropdown}
          fullpage
          label={t('httpVersion')}
          id="app-settings-http-enabled"
          disabled={!app_write || !editable}
          options={[
            {
              key: true,
              text: '2.0',
            },
            {
              key: false,
              text: '1.1',
            },
          ]}
        />
      )}
      {scenarioChecker.checkScenario(ScenarioIds.webSocketsSupported, { site }).status !== 'disabled' && (
        <Field
          name="config.properties.webSocketsEnabled"
          component={RadioButton}
          fullpage
          upsellMessage={websocketsEnable.data}
          label={t('webSocketsEnabledLabel')}
          id="app-settings-web-sockets-enabled"
          disabled={!app_write || !editable || websocketsEnable.status === 'disabled'}
          options={[
            {
              key: true,
              text: t('on'),
            },
            {
              key: false,
              text: t('off'),
            },
          ]}
        />
      )}
      {scenarioChecker.checkScenario(ScenarioIds.alwaysOnSupported, { site }).status !== 'disabled' && (
        <Field
          name="config.properties.alwaysOn"
          component={RadioButton}
          fullpage
          upsellMessage={alwaysOnEnable.data}
          label={t('alwaysOn')}
          id="app-settings-always-on"
          disabled={!app_write || !editable || alwaysOnEnable.status === 'disabled'}
          options={[
            {
              key: true,
              text: t('on'),
            },
            {
              key: false,
              text: t('off'),
            },
          ]}
        />
      )}
      {scenarioChecker.checkScenario(ScenarioIds.clientAffinitySupported, { site }).status !== 'disabled' && (
        <Field
          name="site.properties.clientAffinityEnabled"
          component={RadioButton}
          fullpage
          label={t('clientAffinityEnabledLabel')}
          id="app-settings-clientAffinityEnabled"
          disabled={!app_write || !editable}
          options={[
            {
              key: true,
              text: t('on'),
            },
            {
              key: false,
              text: t('off'),
            },
          ]}
        />
      )}
    </div>
  );
};
export default Platform;
