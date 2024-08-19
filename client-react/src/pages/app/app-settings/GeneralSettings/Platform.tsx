import { Field, FormikProps } from 'formik';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../components/form-controls/DropDown';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { AppSettingsFormValues } from '../AppSettings.types';
import { PermissionsContext, SiteContext } from '../Contexts';
import { Links } from '../../../../utils/FwLinks';
import { IPMode, MinTlsVersion, SslState, VnetPrivatePortsCount } from '../../../../models/site/site';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { IDropdownOption, MessageBar, MessageBarType, mergeStyles } from '@fluentui/react';
import { CommonConstants, ScmHosts } from '../../../../utils/CommonConstants';
import MinTLSCipherSuiteSelector from '../../../../components/CipherSuite/MinTLSCipherSuiteSelector';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import useStacks from '../Hooks/useStacks';
import { messageBannerStyle } from '../AppSettings.styles';
import { ThemeContext } from '../../../../ThemeContext';
import { RuntimeExtensionMajorVersions } from '../../../../models/functions/runtime-extension';

const Platform: React.FC<FormikProps<AppSettingsFormValues>> = props => {
  const site = useContext(SiteContext);
  const { t } = useTranslation();
  const { values, initialValues, setFieldValue } = props;
  const scenarioChecker = new ScenarioService(t);
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);

  // @note(krmitta): Only this for linux apps for now.
  const { stackVersionDetails } = useStacks(values?.config.properties.linuxFxVersion);

  const disableAllControls = !app_write || !editable || saving;
  const platformOptionEnable = scenarioChecker.checkScenario(ScenarioIds.enablePlatform64, { site });
  const websocketsEnable = scenarioChecker.checkScenario(ScenarioIds.webSocketsEnabled, { site });
  const alwaysOnEnable = scenarioChecker.checkScenario(ScenarioIds.enableAlwaysOn, { site });
  const sshControlEnabled = useMemo(() => stackVersionDetails.data?.supportedFeatures?.disableSsh, [
    stackVersionDetails.data?.supportedFeatures?.disableSsh,
  ]);
  const gRPCOnlyEnabled = scenarioChecker.checkScenario(ScenarioIds.http20ProxyGRPCOnlySupported, { site });

  const runtimeVersionIsNotV1 = useMemo(() => {
    const functionsExtensionVersion = values.appSettings.find(x => x.name === CommonConstants.AppSettingNames.functionsExtensionVersion);
    return functionsExtensionVersion?.value !== RuntimeExtensionMajorVersions.v1;
  }, [values.appSettings]);

  const http20ProxyDropdownItems = useMemo<IDropdownOption[]>(() => {
    const items = [
      {
        key: 0,
        text: t('off'),
      },
      {
        key: 1,
        text: t('on'),
        disabled: !values.config.properties.http20Enabled,
      },
    ];

    if (gRPCOnlyEnabled.status === 'enabled') {
      items.push({
        key: 2,
        text: t('grpcOnly'),
        disabled: !values.config.properties.http20Enabled,
      });
    }

    return items;
  }, [gRPCOnlyEnabled, values.config.properties.http20Enabled, t]);

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

  const onVnetPrivatePortsCountChange = useCallback(
    (_e, newValue?: string) => {
      if (newValue) {
        const newVnetPrivatePortsCount = +newValue;
        if (newVnetPrivatePortsCount >= VnetPrivatePortsCount.min && newVnetPrivatePortsCount <= VnetPrivatePortsCount.max) {
          setFieldValue('config.properties.vnetPrivatePortsCount', newVnetPrivatePortsCount);
        }
      } else {
        setFieldValue('config.properties.vnetPrivatePortsCount', undefined);
      }
    },
    [setFieldValue]
  );

  const onHttp20EnabledChange = (event: React.FormEvent<HTMLDivElement>, option: { key: boolean }) => {
    props.setFieldValue('config.properties.http20ProxyFlag', 0);
    if (option.key) {
      props.setFieldValue('site.properties.clientCertEnabled', false);
    }

    props.setFieldValue('config.properties.http20Enabled', option.key);
  };

  const ftpBasicAuthBanner = useMemo(() => {
    return (
      values.basicPublishingCredentialsPolicies?.ftp?.properties.allow === true &&
      values.basicPublishingCredentialsPolicies?.scm?.properties.allow === false && (
        <MessageBar
          id="ftp-basic-auth-info-message"
          className={mergeStyles(messageBannerStyle(theme, MessageBarType.info), { maxWidth: '750px' })}
          messageBarType={MessageBarType.info}>
          {t('ftpBasicAuthInfoMessage')}
        </MessageBar>
      )
    );
  }, [values.basicPublishingCredentialsPolicies?.ftp?.properties.allow, values.basicPublishingCredentialsPolicies?.scm?.properties.allow]);

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

      {scenarioChecker.checkScenario(ScenarioIds.basicAuthPublishingCreds, { site }).status !== 'disabled' &&
        values.basicPublishingCredentialsPolicies && (
          <>
            {ftpBasicAuthBanner}
            <Field
              name={'basicPublishingCredentialsPolicies.scm.properties.allow'}
              component={RadioButton}
              label={t('scmBasicAuthPublishingCredentials')}
              id="app-settings-scm-basic-authentication-publishing-creds"
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
            {scenarioChecker.checkScenario(ScenarioIds.ftpBasicAuthSupported, { site }).status !== 'disabled' && (
              <Field
                name={'basicPublishingCredentialsPolicies.ftp.properties.allow'}
                component={RadioButton}
                label={t('ftpBasicAuthPublishingCredentials')}
                infoBubbleMessage={t('basicAuthPublishingCredInfoBubbleMessage')}
                learnMoreLink={Links.disableBasicAuthLearnMore}
                id="app-settings-ftp-basic-authentication-publishing-creds"
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
          </>
        )}

      {scenarioChecker.checkScenario(ScenarioIds.ftpStateSupported, { site }).status !== 'disabled' && (
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
      )}

      {scenarioChecker.checkScenario(ScenarioIds.ipModeSupported, { site }).status === 'enabled' && (
        <Field
          name="site.properties.ipMode"
          dirty={values.site.properties.ipMode !== initialValues.site.properties.ipMode}
          component={Dropdown}
          label={t('inboundIpModePreviewLabel')}
          id="app-settings-ip-mode"
          disabled={disableAllControls}
          options={[
            {
              key: IPMode.IPv4,
              text: t('ipv4'),
            },
            {
              key: IPMode.IPv6,
              text: t('ipv6'),
            },
            {
              key: IPMode.IPv4AndIPv6,
              text: t('ipv4AndIpv6'),
            },
          ]}
        />
      )}

      {scenarioChecker.checkScenario(ScenarioIds.httpVersionSupported, { site }).status !== 'disabled' && (
        <>
          <Field
            name="config.properties.http20Enabled"
            dirty={values.config.properties.http20Enabled !== initialValues.config.properties.http20Enabled}
            component={Dropdown}
            infoBubbleMessage={t('httpCertWarningInfoBubbleMessage')}
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
              component={Dropdown}
              label={t('http20Proxy')}
              infoBubbleMessage={t('https20ProxyInfoBubbleMessage')}
              id="app-settings-http20-proxy-enabled"
              disabled={disableAllControls}
              options={http20ProxyDropdownItems}
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
      {scenarioChecker.checkScenario(ScenarioIds.sshEnabledSupported, { site }).status == 'enabled' && (
        <Field
          name="site.properties.sshEnabled"
          dirty={values.site.properties.sshEnabled !== initialValues.site.properties.sshEnabled}
          component={RadioButton}
          label={t('feature_sshName')}
          id="app-settings-ssh-enabled"
          disabled={disableAllControls || !sshControlEnabled}
          infoBubbleMessage={sshControlEnabled ? '' : t('sshDisabledInfoBubbleMessage')}
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
          widthLabel={'230px'}
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
            {
              key: MinTlsVersion.tLS13,
              text: MinTlsVersion.tLS13,
            },
          ]}
        />
      }
      {scenarioChecker.checkScenario(ScenarioIds.enableMinCipherSuite, { site }).status === 'enabled' && (
        <Field
          name={'config.properties.minTlsCipherSuite'}
          id={'app-settings-minTlsCipherSuite'}
          component={MinTLSCipherSuiteSelector}
          label={t('minTlsCipherSuiteLabel')}
          infoBubbleMessage={t('minTlsCipherSuiteInfoBubbleMessage')}
          dirty={values.config.properties.minTlsCipherSuite !== initialValues.config.properties.minTlsCipherSuite}
          widthLabel={'230px'}
        />
      )}
      {scenarioChecker.checkScenario(ScenarioIds.enableE2ETlsEncryption, { site }).status === 'enabled' && (
        <Field
          name={'site.properties.endToEndEncryptionEnabled'}
          id={'endToEndEncryptionEnabled'}
          component={RadioButton}
          label={t('endToEndEncryptionLabel')}
          dirty={!!values.site.properties.endToEndEncryptionEnabled !== !!initialValues.site.properties.endToEndEncryptionEnabled}
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
          infoBubbleMessage={t('endToEndEncryptionInfoMessage')}
          learnMoreLink={Links.endToEndEncryptionLearnMore}
        />
      )}
      {scenarioChecker.checkScenario(ScenarioIds.vnetPrivatePortsCount, { site }).status === 'enabled' && (
        <Field
          name={'config.properties.vnetPrivatePortsCount'}
          id={'app-settings-vnetPrivatePortsCount'}
          component={TextFieldNoFormik}
          value={values.config.properties.vnetPrivatePortsCount}
          label={t('vnetPrivatePortsCount')}
          dirty={values.config.properties.vnetPrivatePortsCount !== initialValues.config.properties.vnetPrivatePortsCount}
          widthLabel={'230px'}
          type={'number'}
          onChange={onVnetPrivatePortsCountChange}
          infoBubbleMessage={t('portCountRange').format(VnetPrivatePortsCount.min, VnetPrivatePortsCount.max)}
        />
      )}
      {scenarioChecker.checkScenario(ScenarioIds.functionsAdminIsolationSupported, { site }).status !== 'disabled' &&
        runtimeVersionIsNotV1 && (
          <Field
            name="site.properties.functionsRuntimeAdminIsolationEnabled"
            id="app-settings-functionsRuntimeAdminIsolationEnabled"
            label={t('functionsAdminIsolation')}
            infoBubbleMessage={t('functionsAdminIsolationInfoBubble')}
            learnMoreLink={Links.functionsRuntimeAdminIsolationEnabled}
            component={RadioButton}
            dirty={
              values.site.properties.functionsRuntimeAdminIsolationEnabled !==
              initialValues.site.properties.functionsRuntimeAdminIsolationEnabled
            }
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
