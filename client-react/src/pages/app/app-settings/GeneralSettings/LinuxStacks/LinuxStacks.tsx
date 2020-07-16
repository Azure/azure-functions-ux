import { Field, FormikProps } from 'formik';
import React, { useContext, useState, useEffect } from 'react';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { AppSettingsFormValues } from '../../AppSettings.types';
import { AvailableStacksContext, PermissionsContext } from '../../Contexts';
import TextField from '../../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import { ScenarioService } from '../../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../../utils/scenario-checker/scenario-ids';
import { Links } from '../../../../../utils/FwLinks';
import DropdownNoFormik from '../../../../../components/form-controls/DropDownnoFormik';
import i18next from 'i18next';
import { WebAppStack } from '../../../../../models/stacks/web-app-stacks';

type PropsType = FormikProps<AppSettingsFormValues>;

interface VersionDetails {
  runtimeStackName: string;
  majorVersionName: string;
  majorVersionRuntime: string;
  minorVersionName: string;
  minorVersionRuntime: string;
}

const getRuntimeStacks = (builtInStacks: WebAppStack[]) => {
  return builtInStacks.map(stack => ({
    key: stack.value,
    text: stack.displayText,
  }));
};

const getMajorVersions = (builtInStacks: WebAppStack[], stack: string, t: i18next.TFunction) => {
  const stackToLower = (stack || '').toLowerCase();
  const currentStack = builtInStacks.find(s => s.value === stackToLower);
  return !!currentStack
    ? currentStack.majorVersions.map(x => ({
        key: x.value,
        text: x.displayText,
      }))
    : [];
};

const getMinorVersions = (builtInStacks: WebAppStack[], stack: string, majorVersion: string, t: i18next.TFunction) => {
  const stackToLower = (stack || '').toLowerCase();
  const currentStack = builtInStacks.find(s => s.value === stackToLower);
  if (!currentStack) {
    return [];
  }

  const majorVersionToLower = (majorVersion || '').toLowerCase();
  const currentVersion = currentStack.majorVersions.find(m => m.value === majorVersionToLower);
  if (!currentVersion) {
    return [];
  }

  return currentVersion.minorVersions.map(minVer => ({
    text: minVer.displayText,
    key: minVer.value,
  }));
};

const getVersionDetails = (builtInStacks: WebAppStack[], version: string): VersionDetails => {
  let versionDetails = {
    runtimeStackName: '',
    majorVersionName: '',
    majorVersionRuntime: '',
    minorVersionName: '',
    minorVersionRuntime: '',
  };
  if (!!builtInStacks && !!version) {
    builtInStacks.forEach(stack => {
      stack.majorVersions.forEach(stackMajorVersion => {
        stackMajorVersion.minorVersions.forEach(stackMinorVersion => {
          const setting = stackMinorVersion.stackSettings.linuxRuntimeSettings;
          if (setting && setting.runtimeVersion && setting.runtimeVersion.toLocaleLowerCase() === version) {
            versionDetails = {
              runtimeStackName: stack.value,
              majorVersionName: stackMajorVersion.value,
              majorVersionRuntime: stackMajorVersion.value,
              minorVersionName: stackMinorVersion.value,
              minorVersionRuntime: setting.runtimeVersion,
            };
          }
        });
      });
    });
  }

  return versionDetails;
};

const getSelectedRuntimeStack = (builtInStacks: WebAppStack[], version: string) => {
  const versionDetails = getVersionDetails(builtInStacks, version);
  return versionDetails.runtimeStackName;
};

const getSelectedMajorVersion = (builtInStacks: WebAppStack[], version: string) => {
  const versionDetails = getVersionDetails(builtInStacks, version);
  return versionDetails.majorVersionRuntime;
};

const getSelectedMinorVersion = (builtInStacks: WebAppStack[], stack: string, version: string) => {
  const versionDetails = getVersionDetails(builtInStacks, version);
  return versionDetails.minorVersionRuntime;
};

const LinuxStacks: React.FC<PropsType> = props => {
  const { values, setFieldValue, initialValues } = props;
  const { site } = values;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const stacks = useContext(AvailableStacksContext);
  const runtimeOptions = getRuntimeStacks(stacks);
  const { t } = useTranslation();

  const [runtimeStack, setRuntimeStack] = useState(getSelectedRuntimeStack(stacks, values.config.properties.linuxFxVersion));
  const [majorVersionRuntime, setMajorVersionRuntime] = useState<string | null>(
    getSelectedMajorVersion(stacks, values.config.properties.linuxFxVersion)
  );

  const initialVersionDetails = getVersionDetails(stacks, initialValues.config.properties.linuxFxVersion);

  const stackDirty = (): boolean => (runtimeStack || '').toLowerCase() !== initialVersionDetails.runtimeStackName.toLowerCase();

  const majorVersionDirty = (): boolean =>
    (majorVersionRuntime || '').toLowerCase() !== initialVersionDetails.majorVersionRuntime.toLowerCase();

  const minorVersionDirty = (): boolean => {
    const minorVersion = getSelectedMinorVersion(stacks, runtimeStack, values.config.properties.linuxFxVersion);
    return (minorVersion || '').toLowerCase() !== initialVersionDetails.minorVersionRuntime.toLowerCase();
  };

  useEffect(() => {
    const selectedVersionDetails = getVersionDetails(stacks, values.config.properties.linuxFxVersion);
    setRuntimeStack(selectedVersionDetails.runtimeStackName || '');
    setMajorVersionRuntime(selectedVersionDetails.majorVersionRuntime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.config.properties.linuxFxVersion]);

  const scenarioService = new ScenarioService(t);

  return (
    <>
      {scenarioService.checkScenario(ScenarioIds.linuxAppRuntime, { site }).status !== 'disabled' && (
        <>
          <DropdownNoFormik
            selectedKey={runtimeStack}
            dirty={stackDirty()}
            onChange={(e, newVal) => {
              const majorVersions = getMajorVersions(stacks, newVal.key, t);
              setRuntimeStack(newVal.key);
              if (majorVersions.length > 0) {
                const majVer = majorVersions[0];
                setMajorVersionRuntime(majVer.key as string);
                const minorVersions = getMinorVersions(stacks, newVal.key, majVer.key as string, t);
                if (minorVersions.length > 0) {
                  setFieldValue('config.properties.linuxFxVersion', minorVersions[0].key);
                }
              }
            }}
            options={runtimeOptions}
            disabled={disableAllControls}
            label={t('stack')}
            id="linux-fx-version-runtime"
          />
          {runtimeStack && (
            <DropdownNoFormik
              selectedKey={majorVersionRuntime || ''}
              dirty={majorVersionDirty()}
              onChange={(e, newVal) => {
                const minorVersions = getMinorVersions(stacks, runtimeStack, newVal.key, t);
                setMajorVersionRuntime(newVal.key);
                if (minorVersions.length > 0) {
                  setFieldValue('config.properties.linuxFxVersion', minorVersions[0].key);
                }
              }}
              options={getMajorVersions(stacks, runtimeStack, t)}
              disabled={disableAllControls}
              label={t('majorVersion')}
              id="linux-fx-version-major-version"
            />
          )}
          {majorVersionRuntime && (
            <Field
              name="config.properties.linuxFxVersion"
              dirty={minorVersionDirty()}
              component={Dropdown}
              disabled={disableAllControls}
              label={t('minorVersion')}
              id="linux-fx-version-minor-version"
              options={getMinorVersions(stacks, runtimeStack, majorVersionRuntime, t)}
            />
          )}
        </>
      )}
      <Field
        name="config.properties.appCommandLine"
        component={TextField}
        dirty={values.config.properties.appCommandLine !== initialValues.config.properties.appCommandLine}
        disabled={disableAllControls}
        label={t('appCommandLineLabel')}
        id="linux-fx-version-appCommandLine"
        infoBubbleMessage={t('appCommandLineLabelHelpNoLink')}
        learnMoreLink={Links.startupFileInfo}
        style={{ marginLeft: '1px', marginTop: '1px' }} // Not sure why but left border disappears without margin and for small windows the top also disappears
      />
    </>
  );
};
export default LinuxStacks;
