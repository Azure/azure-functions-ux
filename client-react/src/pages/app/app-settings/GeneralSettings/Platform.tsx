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
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { MinTlsVersion, SslState } from '../../../../models/site/site';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { IDropdownOption, MessageBarType } from '@fluentui/react';

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
  // const showAllMinTlsVersions = scenarioChecker.checkScenario(ScenarioIds.showAllMinTlsVersions, { site });

  !values.site.properties.siteConfig.minTlsVersion && (values.site.properties.siteConfig.minTlsVersion = MinTlsVersion.tLS12);

  const showHttpsOnlyInfo = (): boolean => {
    const siteProperties = values.site.properties;
    return (
      !!siteProperties.httpsOnly &&
      !!siteProperties.hostNameSslStates.some(hostNameSslState => {
        // catch only the custom domains that dont have an SSL binding.
        // default hostname of the app and the scm site are ignored.
        const hostNameSslStateName = hostNameSslState.name || '';
        return (
          hostNameSslState.sslState === SslState.Disabled &&
          siteProperties.defaultHostName !== hostNameSslStateName &&
          !(
            hostNameSslStateName.includes('.scm.azurewebsites.net') ||
            hostNameSslStateName.includes('.scm.azurewebsites.us') ||
            hostNameSslStateName.includes('.scm.chinacloudsites.cn') ||
            hostNameSslStateName.includes('.scm.azurewebsites.de')
          )
        );
      })
    );
  };

  const getMinTlsVersionDropdownOptions = (): IDropdownOption[] => {
    const options: IDropdownOption[] = [
      {
        key: MinTlsVersion.tLS12,
        text: t('tlsVersion12'),
      },
    ];

    if (true) {
      options.unshift(
        ...[
          {
            key: MinTlsVersion.tLS10,
            text: t('tlsVersion10'),
          },
          {
            key: MinTlsVersion.tLS11,
            text: t('tlsVersion11'),
          },
        ]
      );
    }

    return options;
  };

  const disableFtp = () =>
    props.values.basicPublishingCredentialsPolicies &&
    props.values.basicPublishingCredentialsPolicies.properties.ftp &&
    !props.values.basicPublishingCredentialsPolicies.properties.ftp.allow;

  return (
    <div>
      {scenarioChecker.checkScenario(ScenarioIds.platform64BitSupported, { site }).status !== 'disabled' &&
        values.currentlySelectedStack !== 'java' && (
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
      {scenarioChecker.checkScenario(ScenarioIds.ftpStateSupported, { site }).status !== 'disabled' &&
        (disableFtp() ? (
          <DropdownNoFormik
            onChange={() => {}}
            infoBubbleMessage={t('ftpDisabledByPolicy')}
            learnMoreLink={Links.ftpDisabledByPolicyLink}
            label={t('ftpState')}
            id="app-settings-ftps-state"
            disabled={true}
            defaultSelectedKey={'Disabled'}
            options={[
              {
                key: 'Disabled',
                text: t('disabled'),
              },
            ]}
          />
        ) : (
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
        ))}
      {scenarioChecker.checkScenario(ScenarioIds.httpVersionSupported, { site }).status !== 'disabled' && (
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
      {showHttpsOnlyInfo() && <CustomBanner id={'httpsOnly-customBanner'} message={t('httpsOnlyInfoBoxText')} type={MessageBarType.info} />}
      {
        <Field
          name={'site.properties.httpsOnly'}
          id={'app-settings-httpsOnly'}
          component={RadioButton}
          dirty={values.site.properties.httpsOnly !== initialValues.site.properties.httpsOnly}
          label={t('httpsOnlyLabel')}
          infoBubbleMessage={t('httpsOnlyInfoBubbleMessage')}
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
      }
      {
        <Field
          name={'site.properties.siteConfig.minTlsVersion'}
          id={'app-settings-minTlsVersion'}
          component={Dropdown}
          label={t('minTlsVersionLabel')}
          infoBubbleMessage={t('minTlsVersionInfoBubbleMessage')}
          dirty={values.site.properties.siteConfig.minTlsVersion !== initialValues.site.properties.siteConfig.minTlsVersion}
          options={getMinTlsVersionDropdownOptions()}
        />
      }
    </div>
  );
};
export default Platform;
