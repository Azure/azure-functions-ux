import { Field, FormikProps } from 'formik';
import React, { useContext, useState, useEffect } from 'react';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { AppSettingsFormValues } from '../../AppSettings.types';
import { PermissionsContext, WebAppStacksContext } from '../../Contexts';
import TextField from '../../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import { ScenarioService } from '../../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../../utils/scenario-checker/scenario-ids';
import { Links } from '../../../../../utils/FwLinks';
import DropdownNoFormik from '../../../../../components/form-controls/DropDownnoFormik';
import {
  getRuntimeStacks,
  getSelectedRuntimeStack,
  getSelectedMajorVersion,
  getVersionDetails,
  getSelectedMinorVersion,
  getMajorVersions,
  getMinorVersions,
  LINUXJAVASTACKKEY,
  isJavaStackSelected,
} from './LinuxStacks.data';
import JavaStack from './JavaStack';

type PropsType = FormikProps<AppSettingsFormValues>;

const LinuxStacks: React.FC<PropsType> = props => {
  const { values, setFieldValue, initialValues } = props;
  const { site } = values;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const stacks = useContext(WebAppStacksContext);
  const runtimeOptions = getRuntimeStacks(stacks);
  const { t } = useTranslation();
  const scenarioService = new ScenarioService(t);

  const [runtimeStack, setRuntimeStack] = useState<string | undefined>(undefined);
  const [majorVersionRuntime, setMajorVersionRuntime] = useState<string | null>(null);

  const initialVersionDetails = getVersionDetails(stacks, initialValues.config.properties.linuxFxVersion);

  const isRuntimeStackDirty = (): boolean =>
    getRuntimeStack(values.config.properties.linuxFxVersion) !== getRuntimeStack(initialValues.config.properties.linuxFxVersion);

  const isMajorVersionDirty = (): boolean =>
    (majorVersionRuntime || '').toLowerCase() !== initialVersionDetails.majorVersionRuntime.toLowerCase();

  const isMinorVersionDirty = (): boolean => {
    if (runtimeStack) {
      const minorVersion = getSelectedMinorVersion(stacks, runtimeStack, values.config.properties.linuxFxVersion);
      return (minorVersion || '').toLowerCase() !== initialVersionDetails.minorVersionRuntime.toLowerCase();
    } else {
      return false;
    }
  };

  const onRuntimeStackChange = (newRuntimeStack: string) => {
    setRuntimeStack(newRuntimeStack);
    if (newRuntimeStack !== LINUXJAVASTACKKEY) {
      const majorVersions = getMajorVersions(stacks, newRuntimeStack, t);
      if (majorVersions.length > 0) {
        const majVer = majorVersions[0];
        setMajorVersionRuntime(majVer.key as string);
        const minorVersions = getMinorVersions(stacks, newRuntimeStack, majVer.key as string, t);
        if (minorVersions.length > 0) {
          setFieldValue('config.properties.linuxFxVersion', minorVersions[0].key);
        }
      }
    }
  };

  const onMajorVersionChange = (newMajorVersion: string) => {
    if (runtimeStack) {
      const minorVersions = getMinorVersions(stacks, runtimeStack, newMajorVersion, t);
      setMajorVersionRuntime(newMajorVersion);
      if (minorVersions.length > 0) {
        setFieldValue('config.properties.linuxFxVersion', minorVersions[0].key);
      }
    }
  };

  const getRuntimeStack = (linuxFxVersion: string) => {
    return isJavaStackSelected(stacks, linuxFxVersion) ? LINUXJAVASTACKKEY : getSelectedRuntimeStack(stacks, linuxFxVersion);
  };

  const setRuntimeStackAndMajorVersion = () => {
    setRuntimeStack(getRuntimeStack(values.config.properties.linuxFxVersion));
    setMajorVersionRuntime(getSelectedMajorVersion(stacks, values.config.properties.linuxFxVersion));
  };

  useEffect(() => {
    setRuntimeStackAndMajorVersion();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.config.properties.linuxFxVersion]);
  return (
    <>
      {runtimeStack && scenarioService.checkScenario(ScenarioIds.linuxAppRuntime, { site }).status !== 'disabled' && (
        <>
          <DropdownNoFormik
            selectedKey={runtimeStack}
            dirty={isRuntimeStackDirty()}
            onChange={(e, newVal) => onRuntimeStackChange(newVal.key)}
            options={runtimeOptions}
            disabled={disableAllControls}
            label={t('stack')}
            id="linux-fx-version-runtime"
          />
          {runtimeStack !== LINUXJAVASTACKKEY ? (
            <>
              <DropdownNoFormik
                selectedKey={majorVersionRuntime || ''}
                dirty={isMajorVersionDirty()}
                onChange={(e, newVal) => onMajorVersionChange(newVal.key)}
                options={getMajorVersions(stacks, runtimeStack, t)}
                disabled={disableAllControls}
                label={t('majorVersion')}
                id="linux-fx-version-major-version"
              />
              {majorVersionRuntime && (
                <Field
                  name="config.properties.linuxFxVersion"
                  dirty={isMinorVersionDirty()}
                  component={Dropdown}
                  disabled={disableAllControls}
                  label={t('minorVersion')}
                  id="linux-fx-version-minor-version"
                  options={getMinorVersions(stacks, runtimeStack, majorVersionRuntime, t)}
                />
              )}
            </>
          ) : (
            <JavaStack {...props} />
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
        learnMoreLink={Links.linuxContainersLearnMore}
        style={{ marginLeft: '1px', marginTop: '1px' }} // Not sure why but left border disappears without margin and for small windows the top also disappears
      />
    </>
  );
};
export default LinuxStacks;
