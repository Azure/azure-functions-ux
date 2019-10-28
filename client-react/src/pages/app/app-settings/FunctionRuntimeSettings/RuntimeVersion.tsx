import { FormikProps, Field } from 'formik';
import React, { useContext, useState, useEffect } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { AppSettingsFormValues, FormAppSetting, FunctionsRuntimeMajorVersions, FunctionsRuntimeVersionInfo } from '../AppSettings.types';
import { PermissionsContext } from '../Contexts';
import RadioButtonNoFormik from '../../../../components/form-controls/RadioButtonNoFormik';
import TextFieldNoLabel from '../../../../components/form-controls/TextFieldNoLabel';
import { IChoiceGroupOption } from 'office-ui-fabric-react';
import { isEqual } from 'lodash-es';
import { style } from 'typestyle';
import {
  getFunctionsRuntimeMajorVersion,
  findFormAppSetting,
  findFormAppSettingIndex,
  getFunctionsRuntimeGeneration,
} from '../AppSettingsFormData';
import { CommonConstants } from '../../../../utils/CommonConstants';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import InfoBox from '../../../../components/InfoBox/InfoBox';
import ReactiveFormControl from '../../../../components/form-controls/ReactiveFormControl';

const getRuntimeVersion = (appSettings: FormAppSetting[]) => {
  const appSetting = findFormAppSetting(appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion);
  return appSetting && appSetting.value;
};

const RuntimeVersion: React.FC<FormikProps<AppSettingsFormValues> & WithTranslation> = props => {
  const [hideDebugText, setHideDebugText] = useState(false);
  const { t, values, initialValues, setFieldValue } = props;
  const scenarioChecker = new ScenarioService(t);
  const [focusTextField, setFocusTextField] = useState(false);
  const { app_write, editable, saving } = useContext(PermissionsContext);
  let fieldRef: any;

  useEffect(() => {
    if (focusTextField) {
      if (fieldRef) {
        fieldRef.focus();
      }
      setFocusTextField(false);
    }
  }, [focusTextField]);

  const isStopped =
    initialValues.site.properties.state && initialValues.site.properties.state.toLocaleLowerCase() !== 'Running'.toLocaleLowerCase();

  const exactRuntimeVersion = !!initialValues.hostStatus ? initialValues.hostStatus.properties.version : null;
  const exactRuntimeGeneration = getFunctionsRuntimeGeneration(exactRuntimeVersion);

  const runtimeVersion = getRuntimeVersion(values.appSettings);
  const initialRuntimeVersion = getRuntimeVersion(initialValues.appSettings);

  const selectedVersionOption = values.functionsRuntimeVersionInfo.isCustom ? FunctionsRuntimeMajorVersions.custom : runtimeVersion!;

  const customVersionErrorMessage = values.functionsRuntimeVersionInfo.isCustom && values.functionsRuntimeVersionInfo.errorMessage;

  const checkConfiguredVersion = () => {
    if (!initialRuntimeVersion) {
      return {
        needToUpdateVersion: false,
        latestVersion: FunctionsRuntimeMajorVersions.v3,
        badRuntimeVersion: false,
      };
    }

    const index = FunctionsService.FunctionsVersionInfo.runtimeStable.findIndex(v => {
      return initialRuntimeVersion.toLowerCase() === v;
    });

    if (index !== -1) {
      return {
        needToUpdateVersion: false,
        latestVersion: initialRuntimeVersion,
        badRuntimeVersion: false,
      };
    }

    let majorVersion = FunctionsRuntimeMajorVersions.v3;
    if (initialRuntimeVersion.startsWith('1.')) {
      majorVersion = FunctionsRuntimeMajorVersions.v1;
    }
    if (initialRuntimeVersion.startsWith('2.')) {
      majorVersion = FunctionsRuntimeMajorVersions.v2;
    }
    if (initialRuntimeVersion.startsWith('3.')) {
      majorVersion = FunctionsRuntimeMajorVersions.v3;
    }

    return {
      needToUpdateVersion: true,
      latestVersion: majorVersion,
      badRuntimeVersion: !!exactRuntimeVersion && initialRuntimeVersion !== exactRuntimeVersion.replace(/.0$/, '-alpha'),
    };
  };

  const { needToUpdateVersion, badRuntimeVersion, latestVersion } = checkConfiguredVersion();
  // const disableRuntimeSelector = false;

  const onSelectCustomVersion = () => {
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
    const errorMessage =
      getFunctionsRuntimeMajorVersion(version) !== FunctionsRuntimeMajorVersions.custom
        ? t('appFunctionSettings_cutomRuntimeVersionError').format(version)
        : '';
    setRuntimeCustomEdit({ ...values.functionsRuntimeVersionInfo, errorMessage, latestCustomValue: version });
  };

  const onTextFieldBlur = () => {
    const version = values.functionsRuntimeVersionInfo.latestCustomValue;
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
          // <div className={style({ display: 'inline-block', marginLeft: '5px', verticalAlign: 'baseline' })}>
          <div className={style({ display: 'block', marginTop: '5px', width: '275px' })}>
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
              onBlur={() => {
                if (values.functionsRuntimeVersionInfo.isCustom) {
                  onTextFieldBlur();
                }
              }}
              value={values.functionsRuntimeVersionInfo.latestCustomValue}
              // style={{ marginLeft: '1px', marginTop: '1px', width: '250px' }}
              placeholder={t('appFunctionSettings_cutomRuntimeVersionPlaceholder')}
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
      {!isStopped && (
        <>
          <ReactiveFormControl label={t('Exact Runtime Version')} id="function-app-settings-exact-runtime-version">
            <div
              id="function-app-settings-exact-runtime-version"
              aria-labelledby="function-app-settings-exact-runtime-version-label"
              onClick={() => setHideDebugText(!hideDebugText)}>
              {exactRuntimeVersion}
            </div>
          </ReactiveFormControl>
          {!hideDebugText && <div>Exact Runtime Generation: {exactRuntimeGeneration}</div>}
          {!hideDebugText && <div>Runtime Version: {runtimeVersion}</div>}
          {!hideDebugText && <div>Initial Runtime Version: {initialRuntimeVersion}</div>}
          {!hideDebugText && <div>{needToUpdateVersion ? 'NEED TO UPDATE' : 'DONT NEED TO UPDATE'}</div>}
          {!hideDebugText && <div>{badRuntimeVersion ? 'NOT VALID' : 'VALID'}</div>}
          {!hideDebugText && <div>Latest Runtime Version: {latestVersion}</div>}
          !hideDebugText && <div>{!fieldRef ? 'UNDEFINED' : 'DEFINED'}</div>
          {scenarioChecker.checkScenario(ScenarioIds.functionsRuntimeVersion, { site: props.initialValues.site }).status !== 'disabled' && (
            <>
              <InfoBox id="function-app-settings-runtime-version-info" type="Info" message={t('appFunctionSettings_runtimeVersionInfo')} />
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
            </>
          )}
        </>
      )}
    </>
  );
};

export default withTranslation('translation')(RuntimeVersion);
