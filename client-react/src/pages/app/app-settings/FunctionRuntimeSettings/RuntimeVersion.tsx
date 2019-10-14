import { FormikProps, Field } from 'formik';
// import React, { useContext, useState } from 'react';
import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues, FormAppSetting } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
// import TextField from '../../../../components/form-controls/TextField';
import RadioButtonNoFormik from '../../../../components/form-controls/RadioButtonNoFormik';
import { isLinuxApp } from '../../../../utils/arm-utils';
import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import { IChoiceGroupOption } from 'office-ui-fabric-react';

// ROUTING_EXTENSION_VERSION
// disabled

enum FunctionRuntimeVersions {
  v1 = '~1',
  v2 = '~2',
  v3 = '~3',
  custom = 'custom',
}

const isMajorVersion = (version: string | null) => {
  return version === FunctionRuntimeVersions.v1 || version === FunctionRuntimeVersions.v2 || version === FunctionRuntimeVersions.v3;
};

const getSettingValue = (settingName: string, appSettings: FormAppSetting[]) => {
  if (!settingName || !appSettings) {
    return null;
  }
  const index = appSettings.findIndex(x => x.name.toLowerCase() === settingName.toLowerCase());
  return index === -1 ? null : appSettings[index].value;
};

// const RuntimeVersion: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
const RuntimeVersion: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  // const [customEditMode, setCustomEditMode] = useState(false);
  const { t, values, initialValues, setFieldValue } = props;
  const { app_write, editable } = useContext(PermissionsContext);

  // if (customEditMode && !props.dirty) {
  //   setCustomEditMode(false);
  // }

  const options: IChoiceGroupOption[] = [
    {
      key: FunctionRuntimeVersions.v1,
      text: t('~1'),
    },
    {
      key: FunctionRuntimeVersions.v2,
      text: t('~2'),
    },
    {
      key: FunctionRuntimeVersions.v3,
      text: t('~3'),
    },
    {
      key: FunctionRuntimeVersions.custom,
      text: t('custom'),
    },
  ];

  const getRuntimeVersion = () => {
    return getSettingValue('FUNCTIONS_EXTENSION_VERSION', values.appSettings);
  };

  const getInitialRuntimeVersion = () => {
    return getSettingValue('FUNCTIONS_EXTENSION_VERSION', initialValues.appSettings);
  };

  const getRuntimeVersionOption = () => {
    // if (customEditMode) {
    if (values.runtimeCustomEdit) {
      return FunctionRuntimeVersions.custom;
    }

    const configuredValue = getRuntimeVersion();
    if (isMajorVersion(configuredValue)) {
      return configuredValue!;
    }

    // setCustomEditMode(true);
    setFieldValue('runtimeCustomEdit', true);
    return FunctionRuntimeVersions.custom;
  };

  const runtimeVersionDirty = () => {
    const value = getRuntimeVersion();
    const initialValue = getInitialRuntimeVersion();

    return !(value === null && initialValue === null) && value !== initialValue;
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

  // runtimeVersion (app setting value)
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

  const onRadioButtonChange = (version: string) => {
    const appSettings: FormAppSetting[] = [...values.appSettings];
    const index = appSettings.findIndex(x => x.name.toLowerCase() === 'FUNCTIONS_EXTENSION_VERSION'.toLowerCase());
    if (version === FunctionRuntimeVersions.custom) {
      // setCustomEditMode(true);
      setFieldValue('runtimeCustomEdit', true);
      const value = index === -1 ? null : appSettings[index].value;
      if (value && isMajorVersion(value)) {
        // appSettings[index] = { ...appSettings[index], value: '' };
        appSettings.splice(index, 1);
        setFieldValue('appSettings', appSettings);
      }
    } else {
      // setCustomEditMode(false);
      setFieldValue('runtimeCustomEdit', false);
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
    }
  };

  const onTextFieldChange = (version: string) => {
    const newVersion = version; // === '~1' || version === '~2' || version === '~3' ? '' : version;
    const appSettings: FormAppSetting[] = [...values.appSettings];
    const index = appSettings.findIndex(x => x.name.toLowerCase() === 'FUNCTIONS_EXTENSION_VERSION'.toLowerCase());
    if (index === -1) {
      appSettings.push({
        name: 'FUNCTIONS_EXTENSION_VERSION',
        value: newVersion,
        sticky: false,
      });
    } else {
      appSettings[index] = { ...appSettings[index], value: newVersion };
    }
    setFieldValue('appSettings', appSettings);
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
      {isLinuxApp(props.initialValues.site) || !values.appSettings ? (
        <div>IsLinux OR NoAppSettings</div>
      ) : (
        <>
          <RadioButtonNoFormik
            selectedKey={getRuntimeVersionOption()}
            dirty={runtimeVersionDirty()}
            label={t('runtimeVersion')}
            id="functions-runtime-version"
            disabled={!app_write || !editable}
            onChange={(e, newVal) => {
              onRadioButtonChange(newVal ? newVal.key : '');
            }}
            options={options}
            vertical={true}
          />
          {getRuntimeVersionOption() === FunctionRuntimeVersions.custom && (
            <Field
              // dirty={values.site.properties.dailyMemoryTimeQuota !== initialValues.site.properties.dailyMemoryTimeQuota}
              component={TextFieldNoFormik}
              label={t('Custom runtime version')}
              id="functions-runtime-version-custom"
              disabled={!app_write || !editable}
              onChange={(e, newVal) => {
                onTextFieldChange(newVal);
              }}
              value={getRuntimeVersion()}
              style={{ marginLeft: '1px', marginTop: '1px' }}
            />
          )}
        </>
      )}
    </>
  );
};

export default withTranslation('translation')(RuntimeVersion);
