import { FormikProps, Field } from 'formik';
import React, { useContext, useState, useEffect } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues, FormAppSetting, FunctionsRuntimeMajorVersions, FunctionsRuntimeVersionInfo } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import RadioButtonNoFormik from '../../../../components/form-controls/RadioButtonNoFormik';
import { isLinuxApp } from '../../../../utils/arm-utils';
// import TextFieldNoFormik from '../../../../components/form-controls/TextFieldNoFormik';
import TextFieldNoLabel from '../../../../components/form-controls/TextFieldNoLabel';
import { IChoiceGroupOption, Stack, Icon, Link } from 'office-ui-fabric-react';
import { isEqual } from 'lodash-es';
import { settingsWrapper } from '../AppSettingsForm';
import { style } from 'typestyle';
import { getFunctionsRuntimeMajorVersion, findFormAppSetting, findFormAppSettingIndex } from '../AppSettingsFormData';
import { infoIconStyle, learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import { Links } from '../../../../utils/FwLinks';
import { ThemeContext } from '../../../../ThemeContext';
import { CommonConstants } from '../../../../utils/CommonConstants';

const getRuntimeVersion = (appSettings: FormAppSetting[]) => {
  const appSetting = findFormAppSetting(appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);
  return appSetting && appSetting.value;
};

const RuntimeVersion: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const { t, values, initialValues, setFieldValue } = props;
  const [focusTextField, setFocusTextField] = useState(false);
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const theme = useContext(ThemeContext);
  let fieldRef: any;

  useEffect(() => {
    if (focusTextField) {
      if (fieldRef) {
        fieldRef.focus();
      }
      setFocusTextField(false);
    }
  }, [focusTextField]);

  const exactRuntimeVersion = !!values.hostStatus ? values.hostStatus.properties.version : null;

  const runtimeVersion = getRuntimeVersion(values.appSettings);
  const initialRuntimeVersion = getRuntimeVersion(initialValues.appSettings);

  const selectedVersionOption = values.functionsRuntimeVersionInfo.isCustom ? FunctionsRuntimeMajorVersions.custom : runtimeVersion!;

  const customVersionErrorMessage =
    values.functionsRuntimeVersionInfo.isCustom &&
    getFunctionsRuntimeMajorVersion(values.functionsRuntimeVersionInfo.latestCustomValue) !== FunctionsRuntimeMajorVersions.custom
      ? `Select the '${values.functionsRuntimeVersionInfo.latestCustomValue}' option above.`
      : '';

  // const needUpdateExtensionVersion = false;
  // const badRuntimeVersion = false;
  // const disableRuntimeSelector = false;

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

  // const needToUpdateRuntime = (version: string | null) => {
  //   const runtimeStable = ['~1', 'beta', '~2', 'latest', '~3'];

  //   const match =
  //     !!version &&
  //     runtimeStable.find(v => {
  //       return version.toLowerCase() === v;
  //     });
  //   return !match;
  // };

  // const getLatestVersion = (version: string | null) => {
  //   const runtimeStable = ['~1', 'beta', '~2', 'latest', '~3'];
  //   const match =
  //     !!version &&
  //     runtimeStable.find(v => {
  //       return version.toLowerCase() === v;
  //     });

  //   if (match) {
  //     return match;
  //   }

  //   if (!!version) {
  //     if (version.startsWith('1.')) {
  //       return FunctionsRuntimeMajorVersions.v1;
  //     }
  //     if (version.startsWith('2.')) {
  //       return FunctionsRuntimeMajorVersions.v2;
  //     }
  //     if (version.startsWith('3.')) {
  //       return FunctionsRuntimeMajorVersions.v3;
  //     }
  //   }

  //   return FunctionsRuntimeMajorVersions.v3;
  // };

  // const setNeedUpdateExtensionVersion = () => {
  //   const needUpdateExtensionVersion = needToUpdateRuntime(initialRuntimeVersion);
  //   const latestExtensionVersion = getLatestVersion(initialRuntimeVersion);
  // };

  const isValidRuntimeVersion = () => {
    const runtimeStable = ['~1', 'beta', '~2', 'latest', '~3'];

    if (!initialRuntimeVersion) {
      return false;
    }

    if (initialRuntimeVersion === exactRuntimeVersion) {
      return true;
    }

    if (!!exactRuntimeVersion && initialRuntimeVersion === exactRuntimeVersion.replace(/.0$/, '-alpha')) {
      return true;
    }

    return !!runtimeStable.find(v => {
      return initialRuntimeVersion.toLowerCase() === v;
    });
  };

  const onSelectCustomVersion = () => {
    const appSettings: FormAppSetting[] = [...values.appSettings];
    const index = findFormAppSettingIndex(appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);
    // const value = index !== -1 ? '' : appSettings[index].value;
    // if (value && getFunctionsRuntimeMajorVersion(value) === FunctionsRuntimeMajorVersions.custom) {
    if (!values.functionsRuntimeVersionInfo.latestCustomValue) {
      appSettings.splice(index, 1);
    } else {
      appSettings[index] = { ...appSettings[index], value: values.functionsRuntimeVersionInfo.latestCustomValue };
    }
    setFieldValue('appSettings', appSettings);
    // }
    setRuntimeCustomEdit({ ...values.functionsRuntimeVersionInfo, isCustom: true });
    setFocusTextField(true);
  };

  const onSelectNonCustomVersion = (version: string) => {
    const appSettings: FormAppSetting[] = [...values.appSettings];
    const index = findFormAppSettingIndex(appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);
    if (index === -1) {
      appSettings.push({
        name: CommonConstants.AppSettingNames.functionsExtensionVersion,
        value: version,
        sticky: false,
      });
    } else {
      appSettings[index] = { ...appSettings[index], value: version };
    }
    setRuntimeCustomEdit({ ...values.functionsRuntimeVersionInfo, isCustom: false });
    setFieldValue('appSettings', appSettings);
  };

  const onRadioButtonChange = (version: string) => {
    if (version === FunctionsRuntimeMajorVersions.custom) {
      onSelectCustomVersion();
    } else {
      onSelectNonCustomVersion(version);
    }
  };

  const onTextFieldChange = (version: string) => {
    const appSettings: FormAppSetting[] = [...values.appSettings];
    const index = findFormAppSettingIndex(appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);
    if (index === -1) {
      if (version) {
        appSettings.push({
          name: CommonConstants.AppSettingNames.functionsExtensionVersion,
          value: version,
          sticky: false,
        });
      }
    } else if (version) {
      appSettings[index] = { ...appSettings[index], value: version };
    } else {
      appSettings.splice(index, 1);
    }
    setRuntimeCustomEdit({ ...values.functionsRuntimeVersionInfo, latestCustomValue: version });
    setFieldValue('appSettings', appSettings);
  };

  const onRenderCustomVersionField = (
    fieldProps: IChoiceGroupOption | undefined,
    render: (props: IChoiceGroupOption | undefined) => JSX.Element | null
  ) => {
    return (
      <>
        {render!(fieldProps)}
        {(values.functionsRuntimeVersionInfo.isCustom || true) && (
          <div className={style({ display: 'inline-block', marginLeft: '5px', verticalAlign: 'baseline' })}>
            <Field
              dirty={!isEqual(runtimeVersion, initialRuntimeVersion)}
              component={TextFieldNoLabel}
              id="function-app-settings-runtime-version-custom"
              errorMessage={customVersionErrorMessage}
              disabled={!app_write || !editable || saving || !values.functionsRuntimeVersionInfo.isCustom}
              onChange={(e, newVal) => {
                if (values.functionsRuntimeVersionInfo.isCustom) {
                  onTextFieldChange(newVal);
                }
              }}
              value={values.functionsRuntimeVersionInfo.latestCustomValue}
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
  };

  const options: IChoiceGroupOption[] = [
    {
      key: FunctionsRuntimeMajorVersions.v1,
      text: t('~1'),
    },
    {
      key: FunctionsRuntimeMajorVersions.v2,
      text: t('~2'),
    },
    {
      key: FunctionsRuntimeMajorVersions.v3,
      text: t('~3'),
    },
    {
      key: FunctionsRuntimeMajorVersions.custom,
      text: t('custom'),
      onRenderField: onRenderCustomVersionField,
    },
  ];

  const setRuntimeCustomEdit = (functionsRuntimeVersionInfo: FunctionsRuntimeVersionInfo) => {
    if (!isEqual(functionsRuntimeVersionInfo, values.functionsRuntimeVersionInfo)) {
      setFieldValue('functionsRuntimeVersionInfo', functionsRuntimeVersionInfo);
    }
  };

  if (!values.appSettings) {
    return null;
  }

  return (
    <>
      {<div>Exact Runtime Version: {exactRuntimeVersion}</div>}
      {<div>Runtime Version: {runtimeVersion}</div>}
      {<div>Initial Runtime Version: {initialRuntimeVersion}</div>}
      {<div>{isValidRuntimeVersion() ? 'VALID' : 'NOT VALID'}</div>}
      {<div>{!fieldRef ? 'UNDEFINED' : 'DEFINED'}</div>}
      {isLinuxApp(props.initialValues.site) || !values.appSettings ? (
        <div>IsLinux OR NoAppSettings</div>
      ) : (
        <>
          <h3>{t('Runtime version')}</h3>
          <Stack horizontal verticalAlign="center">
            <Icon iconName="Info" className={infoIconStyle(theme)} />
            <p>
              <span id="connection-strings-info-message">{t('connectionStringsInfoMessage')}</span>
              <span id="func-conn-strings-info-text">{` ${t('funcConnStringsInfoText')} `}</span>
              <Link
                id="func-conn-strings-info-learnMore"
                href={Links.funcConnStringsLearnMore}
                target="_blank"
                className={learnMoreLinkStyle}
                aria-labelledby="connection-strings-info-message func-conn-strings-info-text func-conn-strings-info-learnMore">
                {` ${t('learnMore')}`}
              </Link>
            </p>
          </Stack>
          <div className={settingsWrapper}>
            <RadioButtonNoFormik
              selectedKey={selectedVersionOption}
              dirty={!isEqual(runtimeVersion, initialRuntimeVersion)}
              label={t('runtimeVersion')}
              id="function-app-settings-runtime-version"
              disabled={!app_write || !editable || saving}
              onChange={(e, newVal) => {
                onRadioButtonChange(newVal ? newVal.key : '');
              }}
              options={options}
              vertical={true}
            />
          </div>
        </>
      )}
    </>
  );
};

export default withTranslation('translation')(RuntimeVersion);
