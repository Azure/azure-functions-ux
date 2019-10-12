import { FormikProps, Field } from 'formik';
import React, { useContext /*, useState, useEffect*/ } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues, FormAppSetting } from '../AppSettings.types';
import { PermissionsContext, SiteContext } from '../Contexts';
import TextField from '../../../../components/form-controls/TextField';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import RadioButtonNoFormik from '../../../../components/form-controls/RadioButtonNoFormik';

// ROUTING_EXTENSION_VERSION
// disabled

const getSettingValue = (settingName: string, appSettings: FormAppSetting[]) => {
  if (!settingName || !appSettings) {
    return null;
  }
  const index = appSettings.findIndex(x => x.name.toLowerCase() === settingName.toLowerCase());
  return index === -1 ? null : appSettings[index].value;
};

const FunctionRuntimeSettings: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  // const [initialRuntimeVersion, setInitialRuntimeVersion] = useState<string | null>(null);
  // const [exactRuntimeVersion, setExactRuntimeVersion] = useState<string | null>(null);
  const site = useContext(SiteContext);
  const { t, values, initialValues, setFieldValue } = props;
  const scenarioChecker = new ScenarioService(t);
  const { app_write, editable } = useContext(PermissionsContext);

  const getRuntimeVersion = () => {
    return getSettingValue('FUNCTIONS_EXTENSION_VERSION', values.appSettings);
  };

  const getInitialRuntimeVersion = () => {
    return getSettingValue('FUNCTIONS_EXTENSION_VERSION', initialValues.appSettings);
  };

  const getExactRuntimeVersion = () => {
    return !!values.hostStatus ? values.hostStatus.properties.version : null;
  };

  const initialRuntimeVersion = getInitialRuntimeVersion();
  const exactRuntimeVersion = getExactRuntimeVersion();
  const runtimeVersion = getRuntimeVersion();
  // const needUpdateExtensionVersion = false;
  // const badRuntimeVersion = false;
  // const disableRuntimeSelector = false;

  // const showProxyEnable = false;

  // const functionAppEditMode = '';
  // const functionAppEditModeComputed = '';

  //runtimeVersion (app setting value)
  // value
  // notSet
  // failedToLoad - API call failed (permissions)
  // failedToLoad - API call failed (other)

  //exactRuntimeVersion (from HostStatus)
  // value
  // failedToLoad - not present in response
  // failedToLoad - API call failed (permissions)
  // failedToLoad - API call failed (other)

  //availableRuntimeVersions (from VFS call)
  // value
  // failedToLoad - API call failed (permissions)
  // failedToLoad - API call failed (other)

  // useEffect(() => {
  //   setInitialRuntimeVersion(getInitialRuntimeVersion());
  //   setExactRuntimeVersion(getExactRuntimeVersion());
  // }, [initialValues.appSettings]);

  const getAvailableRuntimeVersions = () => {
    if (!initialValues.functionsRuntimeVersions || initialValues.functionsRuntimeVersions.length === 0) {
      return ['~1', '~2', '~3'].map(v => ({
        key: v,
        text: t(v),
        disabled: false,
      }));
    }

    const allVersions = initialValues.functionsRuntimeVersions.sort().reverse();

    let version = allVersions[0];
    let generation = version.charAt(0);

    const latestVersions = [
      {
        key: `~${generation}`,
        text: `~${generation} (${version})`,
        disabled: false,
      },
    ];

    for (let index = 1; index < allVersions.length; index = index + 1) {
      version = allVersions[index];
      if (generation !== version.charAt(0)) {
        generation = version.charAt(0);
        latestVersions.unshift({
          key: `~${generation}`,
          text: `~${generation} (${version})`,
          disabled: false,
        });
      }
    }

    return latestVersions;
  };

  const updateRuntimeVersionSetting = (version: string) => {
    const appSettings: FormAppSetting[] = [...values.appSettings];
    const index = appSettings.findIndex(x => x.name.toLowerCase() === 'FUNCTIONS_EXTENSION_VERSION'.toLowerCase());
    if (index === -1) {
      appSettings.push({
        name: 'FUNCTIONS_EXTENSION_VERSION',
        value: version,
        sticky: false,
      });
    } else {
      appSettings[index] = { ...appSettings[index], value: version };
    }
    setFieldValue('appSettings', appSettings);
  };

  const getOptions = () => {
    const options = getAvailableRuntimeVersions();
    const initialRuntimeVersion = getInitialRuntimeVersion();

    if (!!initialRuntimeVersion && options.findIndex(x => x.key === initialRuntimeVersion) === -1) {
      options.push({
        key: initialRuntimeVersion,
        text: `custom (${initialRuntimeVersion})`,
        disabled: true,
      });
    }
    return options;
  };

  const isValidRuntimeVersion = () => {
    const runtimeStable = ['~1', 'beta', '~2', 'latest', '~3'];

    // const runtimeVersion = getRuntimeVersion();
    // const exactRuntimeVersion = getExactRuntimeVersion();

    if (!runtimeVersion) {
      return false;
    }

    if (runtimeVersion === exactRuntimeVersion) {
      return true;
    }

    if (!!exactRuntimeVersion && runtimeVersion === exactRuntimeVersion.replace(/.0$/, '-alpha')) {
      return true;
    }

    return !!runtimeStable.find(v => {
      return runtimeVersion.toLowerCase() === v;
    });
  };

  if (!values.appSettings) {
    return null;
  }

  return (
    <>
      <div>Initial Runtime Version: {initialRuntimeVersion}</div>
      <div>Exact Runtime Version: {exactRuntimeVersion}</div>
      <div>Runtime Version: {runtimeVersion}</div>
      <br />
      <div>Runtime Version: {getRuntimeVersion()}</div>
      <div>Exact Runtime Version: {getExactRuntimeVersion()}</div>
      {isValidRuntimeVersion() ? <div>VALID</div> : <div>NOT VALID</div>}
      <RadioButtonNoFormik
        selectedKey={getRuntimeVersion() || '~1'}
        dirty={(getRuntimeVersion() || '-') !== (getInitialRuntimeVersion() || '-')}
        label={t('runtimeVersion')}
        id="functions-runtime-version"
        disabled={!app_write || !editable}
        onChange={(e, newVal) => {
          updateRuntimeVersionSetting(newVal ? newVal.key : '');
        }}
        options={getOptions()}
        vertical={true}
      />
      {scenarioChecker.checkScenario(ScenarioIds.dailyUsageQuotaSupported, { site }).status === 'enabled' && (
        <>
          <Field
            name="site.properties.dailyMemoryTimeQuota"
            dirty={values.site.properties.dailyMemoryTimeQuota !== initialValues.site.properties.dailyMemoryTimeQuota}
            component={TextField}
            label={t('dailyUsageQuotaLabel')}
            id="app-settings-daily-memory-time-quota"
            disabled={!app_write || !editable}
            style={{ marginLeft: '1px', marginTop: '1px' }} // Not sure why but left border disappears without margin and for small windows the top also disappears
          />
          {!values.site.properties.enabled && values.site.properties.siteDisabledReason === 1 && <div>WARNING</div>}
        </>
      )}
    </>
  );
};

export default withTranslation('translation')(FunctionRuntimeSettings);
