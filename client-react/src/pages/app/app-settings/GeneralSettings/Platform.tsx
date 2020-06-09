import { Field, FormikProps } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown from '../../../../components/form-controls/DropDown';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext, SiteContext } from '../Contexts';
import { Links } from '../../../../utils/FwLinks';

const Platform: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const site = useContext(SiteContext);
  const { t } = useTranslation();
  const { values, initialValues } = props;
  const scenarioChecker = new ScenarioService(t);
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const platformOptionEnable = scenarioChecker.checkScenario(ScenarioIds.enablePlatform64, { site });
  const websocketsEnable = scenarioChecker.checkScenario(ScenarioIds.webSocketsEnabled, { site });
  const alwaysOnEnable = scenarioChecker.checkScenario(ScenarioIds.enableAlwaysOn, { site });
  return (
    <div>
      {scenarioChecker.checkScenario(ScenarioIds.platform64BitSupported, { site }).status !== 'disabled' && (
        <Field
          name="config.properties.use32BitWorkerProcess"
          dirty={values.config.properties.use32BitWorkerProcess !== initialValues.config.properties.use32BitWorkerProcess}
          component={Dropdown}
          upsellMessage={platformOptionEnable.status === 'disabled' ? platformOptionEnable.data : ''}
          label={t('platform')}
          id="app-settings-worker-process"
          disabled={disableAllControls || platformOptionEnable.status === 'disabled'}
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
          dirty={values.config.properties.managedPipelineMode !== initialValues.config.properties.managedPipelineMode}
          component={Dropdown}
          label={t('managedPipelineVersion')}
          id="app-settings-managed-pipeline-mode"
          disabled={disableAllControls}
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
      <Field
        name="config.properties.ftpsState"
        dirty={values.config.properties.ftpsState !== initialValues.config.properties.ftpsState}
        component={Dropdown}
        infoBubbleMessage={t('ftpsInfoMessage')}
        learnMoreLink={Links.ftpInfo}
        label={t('ftpState')}
        id="app-settings-ftps-state"
        disabled={disableAllControls}
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
      {scenarioChecker.checkScenario(ScenarioIds.addHTTPSwitch, { site }).status !== 'disabled' && (
        <Field
          name="config.properties.http20Enabled"
          dirty={values.config.properties.http20Enabled !== initialValues.config.properties.http20Enabled}
          component={Dropdown}
          fullpage
          label={t('httpVersion')}
          id="app-settings-http-enabled"
          disabled={disableAllControls}
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
          dirty={values.config.properties.webSocketsEnabled !== initialValues.config.properties.webSocketsEnabled}
          component={RadioButton}
          upsellMessage={websocketsEnable.status === 'disabled' ? websocketsEnable.data : ''}
          label={t('webSocketsEnabledLabel')}
          id="app-settings-web-sockets-enabled"
          disabled={disableAllControls || websocketsEnable.status === 'disabled'}
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
          dirty={values.config.properties.alwaysOn !== initialValues.config.properties.alwaysOn}
          component={RadioButton}
          infoBubbleMessage={t('alwaysOnInfoMessage')}
          learnMoreLink={Links.alwaysOnInfo}
          upsellMessage={alwaysOnEnable.status === 'disabled' ? alwaysOnEnable.data : ''}
          label={t('alwaysOn')}
          id="app-settings-always-on"
          disabled={disableAllControls || alwaysOnEnable.status === 'disabled'}
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
          dirty={values.site.properties.clientAffinityEnabled !== initialValues.site.properties.clientAffinityEnabled}
          component={RadioButton}
          infoBubbleMessage={t('arrAffinityInfoMessage')}
          learnMoreLink={Links.clientAffinityInfo}
          label={t('clientAffinityEnabledLabel')}
          id="app-settings-clientAffinityEnabled"
          disabled={disableAllControls}
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
