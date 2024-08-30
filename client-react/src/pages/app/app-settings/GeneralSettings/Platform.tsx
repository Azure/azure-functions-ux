import { Field, FormikProps } from 'formik';
import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../components/form-controls/DropDown';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioCheckResult } from '../../../../utils/scenario-checker/scenario.models';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext, SiteContext } from '../Contexts';
import { Links } from '../../../../utils/FwLinks';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { MinTlsVersion, SslState } from '../../../../models/site/site';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { MessageBarType } from '@fluentui/react';
import { ScmHosts } from '../../../../utils/CommonConstants';

const Platform: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const site = useContext(SiteContext);
  const { t } = useTranslation();
  const { values, initialValues } = props;
  const scenarioChecker = new ScenarioService(t);
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const [platformOptionEnable, setPlatformOptionEnable] = useState<ScenarioCheckResult>({ status: 'disabled' });
  const [websocketsEnable, setWebsocketsEnable] = useState<ScenarioCheckResult>({ status: 'disabled' });
  const [alwaysOnEnable, setAlwaysOnEnable] = useState<ScenarioCheckResult>({ status: 'disabled' });

  const initScenarioResults = async () => {
    const platformOptionEnable = await scenarioChecker.checkScenarioAsync(ScenarioIds.enablePlatform64, { site });
    setPlatformOptionEnable(platformOptionEnable);

    const websocketsEnable = await scenarioChecker.checkScenarioAsync(ScenarioIds.webSocketsEnabled, { site });
    setWebsocketsEnable(websocketsEnable);

    const alwaysOnEnable = await scenarioChecker.checkScenarioAsync(ScenarioIds.enableAlwaysOn, { site });
    setAlwaysOnEnable(alwaysOnEnable);
  };

  useEffect(() => {
    initScenarioResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showHttpsOnlyInfo = (): boolean => {
    const siteProperties = values.site.properties;
    const initialHttpsOnlyValue = !!initialValues.site.properties.httpsOnly;
    return (
      !initialHttpsOnlyValue &&
      !!siteProperties.httpsOnly &&
      !!siteProperties.hostNameSslStates.some(hostNameSslState => {
        // catch only the custom domains that dont have an SSL binding.
        // default hostname of the app and the scm site are ignored.
        const hostNameSslStateName = hostNameSslState.name || '';
        return (
          hostNameSslState.sslState === SslState.Disabled &&
          siteProperties.defaultHostName !== hostNameSslStateName &&
          !ScmHosts.some(host => hostNameSslStateName.includes(host))
        );
      })
    );
  };

  const onHttp20EnabledChange = (event: React.FormEvent<HTMLDivElement>, option: { key: boolean }) => {
    // Set HTTP 2.0 Proxy to 'Off' if http 2.0 is not enabled.
    if (!option.key) {
      props.setFieldValue('config.properties.http20ProxyFlag', 0);
    }

    props.setFieldValue('config.properties.http20Enabled', option.key);
  };

  const disableFtp = () =>
    props.values.basicPublishingCredentialsPolicies &&
    props.values.basicPublishingCredentialsPolicies.properties.ftp &&
    !props.values.basicPublishingCredentialsPolicies.properties.ftp.allow;

  return (
    <div>
      {(window.appsvc && window.appsvc.env.runtimeType === 'OnPrem'
        ? true
        : scenarioChecker.checkScenario(ScenarioIds.platform64BitSupported, { site }).status !== 'disabled') &&
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
        <>
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
            onChange={onHttp20EnabledChange}
          />
          {scenarioChecker.checkScenario(ScenarioIds.http20ProxySupported, { site }).status == 'enabled' && (
            <Field
              name="config.properties.http20ProxyFlag"
              dirty={values.config.properties.http20ProxyFlag !== initialValues.config.properties.http20ProxyFlag}
              component={RadioButton}
              label={t('http20Proxy')}
              infoBubbleMessage={t('https20ProxyInfoBubbleMessage')}
              id="app-settings-http20-proxy-enabled"
              disabled={disableAllControls}
              options={[
                {
                  key: 1,
                  text: t('on'),
                  disabled: !values.config.properties.http20Enabled,
                },
                {
                  key: 0,
                  text: t('off'),
                },
              ]}
            />
          )}
        </>
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
      {showHttpsOnlyInfo() && (
        <CustomBanner id={'httpsOnly-customBanner'} message={t('httpsOnlyInfoBoxText')} type={MessageBarType.info} undocked={true} />
      )}
      {
        <Field
          name={'config.properties.minTlsVersion'}
          id={'app-settings-minTlsVersion'}
          component={Dropdown}
          label={t('minTlsVersionLabel')}
          infoBubbleMessage={t('minTlsVersionInfoBubbleMessage')}
          dirty={values.config.properties.minTlsVersion !== initialValues.config.properties.minTlsVersion}
          disabled={scenarioChecker.checkScenario(ScenarioIds.enableTLSVersion, { site }).status === 'disabled'}
          options={[
            {
              key: MinTlsVersion.tLS10,
              text: MinTlsVersion.tLS10,
            },
            {
              key: MinTlsVersion.tLS11,
              text: MinTlsVersion.tLS11,
            },
            {
              key: MinTlsVersion.tLS12,
              text: MinTlsVersion.tLS12,
            },
          ]}
        />
      }
    </div>
  );
};
export default Platform;
