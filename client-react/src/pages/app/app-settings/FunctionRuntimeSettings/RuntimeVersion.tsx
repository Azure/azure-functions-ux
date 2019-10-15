import { FormikProps, Field } from 'formik';
import React, { useContext } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues, FormAppSetting } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import RadioButtonNoFormik from '../../../../components/form-controls/RadioButtonNoFormik';
import { isLinuxApp } from '../../../../utils/arm-utils';
// import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import TextFieldNoLabel from '../../../../components/form-controls/TextFieldNoLabel';
import { IChoiceGroupOption } from 'office-ui-fabric-react';
import { isEqual } from 'lodash-es';
import { settingsWrapper } from '../AppSettingsForm';
import { style } from 'typestyle';

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

const RuntimeVersion: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const { t, values, initialValues, setFieldValue } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  let fieldRef: any;

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
      onRenderField: (fieldProps, render) => {
        return (
          <>
            {render!(fieldProps)}
            {(values.runtimeCustomEdit.active || true) && (
              <div className={style({ display: 'inline-block', marginLeft: '5px', verticalAlign: 'baseline' })}>
                <Field
                  dirty={customRuntimeVersionDirty()}
                  component={TextFieldNoLabel}
                  id="function-app-settings-runtime-version-custom"
                  disabled={!app_write || !editable || saving || !values.runtimeCustomEdit.active}
                  onChange={(e, newVal) => {
                    if (values.runtimeCustomEdit.active) {
                      onTextFieldChange(newVal);
                    }
                  }}
                  value={values.runtimeCustomEdit.latestValue}
                  style={{ marginLeft: '1px', marginTop: '1px', width: '250px' }}
                  placeholder={'e.g. 1.0.12615.0, 2.0.12742.0, latest'}
                  componentRef={instance => {
                    fieldRef = instance;
                  }}
                />
              </div>
            )}
          </>
        );
      },
    },
  ];

  const setRuntimeCustomEdit = (runtimeCustomEdit: { active: boolean; latestValue: string }) => {
    if (!isEqual(runtimeCustomEdit, values.runtimeCustomEdit)) {
      setFieldValue('runtimeCustomEdit', runtimeCustomEdit);
    }
  };

  const getRuntimeVersion = () => {
    return getSettingValue('FUNCTIONS_EXTENSION_VERSION', values.appSettings);
  };

  const getInitialRuntimeVersion = () => {
    return getSettingValue('FUNCTIONS_EXTENSION_VERSION', initialValues.appSettings);
  };

  const getRuntimeVersionOption = () => {
    if (values.runtimeCustomEdit.active) {
      return FunctionRuntimeVersions.custom;
    }

    return getRuntimeVersion()!;
  };

  // const runtimeVersionDirty = () => {
  //   if (!values.runtimeCustomEdit.active !== !initialValues.runtimeCustomEdit.active) {
  //     return true;
  //   }

  //   if (values.runtimeCustomEdit.active) {
  //     return false;
  //   }

  //   const initialValue = getInitialRuntimeVersion();
  //   const value = getRuntimeVersion();
  //   return !(value === null && initialValue === null) && value !== initialValue;
  // };

  const runtimeVersionDirty = () => {
    const initialValue = getInitialRuntimeVersion();
    const value = getRuntimeVersion();
    return !isEqual(value, initialValue);
  };

  const customRuntimeVersionDirty = () => {
    const initialValue = getInitialRuntimeVersion();
    const value = getRuntimeVersion();

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
      setRuntimeCustomEdit({ ...values.runtimeCustomEdit, active: true });
      const value = index === -1 ? '' : appSettings[index].value;
      if (value && isMajorVersion(value)) {
        if (!values.runtimeCustomEdit.latestValue) {
          appSettings.splice(index, 1);
        } else {
          appSettings[index] = { ...appSettings[index], value: values.runtimeCustomEdit.latestValue };
        }
        setFieldValue('appSettings', appSettings);
      }
      if (fieldRef) {
        fieldRef.focus();
      }
    } else {
      setRuntimeCustomEdit({ ...values.runtimeCustomEdit, active: false });
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
    const appSettings: FormAppSetting[] = [...values.appSettings];
    const index = appSettings.findIndex(x => x.name.toLowerCase() === 'FUNCTIONS_EXTENSION_VERSION'.toLowerCase());
    if (index === -1) {
      if (version) {
        appSettings.push({
          name: 'FUNCTIONS_EXTENSION_VERSION',
          value: version,
          sticky: false,
        });
      }
    } else if (version) {
      appSettings[index] = { ...appSettings[index], value: version };
    } else {
      appSettings.splice(index, 1);
    }
    setRuntimeCustomEdit({ ...values.runtimeCustomEdit, latestValue: version });
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
      {false && <div>Initial Runtime Version: {initialRuntimeVersion}</div>}
      {false && <div>Exact Runtime Version: {exactRuntimeVersion}</div>}
      {false && <div>Runtime Version: {runtimeVersion}</div>}
      {false && <br />}
      {false && <div>Runtime Version: {getRuntimeVersion()}</div>}
      {false && <div>Exact Runtime Version: {getExactRuntimeVersion()}</div>}
      {false && <div>{isValidRuntimeVersion() ? 'VALID' : 'NOT VALID'}</div>}
      {<div>{!fieldRef ? 'UNDEFINED' : 'DEFINED'}</div>}
      {isLinuxApp(props.initialValues.site) || !values.appSettings ? (
        <div>IsLinux OR NoAppSettings</div>
      ) : (
        <>
          <h3>{t('Runtime version')}</h3>
          <div className={settingsWrapper}>
            <RadioButtonNoFormik
              selectedKey={getRuntimeVersionOption()}
              dirty={runtimeVersionDirty()}
              label={t('runtimeVersion')}
              id="function-app-settings-runtime-version"
              disabled={!app_write || !editable || saving}
              onChange={(e, newVal) => {
                onRadioButtonChange(newVal ? newVal.key : '');
              }}
              options={options}
              vertical={true}
            />
            {/* {getRuntimeVersionOption() === FunctionRuntimeVersions.custom && (
              <Field
                dirty={customRuntimeVersionDirty()}
                component={TextFieldNoFormik}
                label={t('Custom runtime version')}
                id="function-app-settings-runtime-version-custom"
                disabled={!app_write || !editable || saving}
                onChange={(e, newVal) => {
                  onTextFieldChange(newVal);
                }}
                value={getRuntimeVersion()}
                style={{ marginLeft: '1px', marginTop: '1px' }}
                placeholder={'e.g. 1.0.12615.0, 2.0.12742.0, latest'}
              />
            )} */}
          </div>
        </>
      )}
    </>
  );
};

export default withTranslation('translation')(RuntimeVersion);
