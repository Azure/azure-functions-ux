import { Field, FormikProps } from 'formik';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useContext, useState, useEffect } from 'react';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { AvailableStack } from '../../../../../models/available-stacks';
import { AppSettingsFormValues } from '../../AppSettings.types';
import { AvailableStacksContext, PermissionsContext } from '../../Contexts';
import TextField from '../../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import { ScenarioService } from '../../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../../utils/scenario-checker/scenario-ids';
import { Links } from '../../../../../utils/FwLinks';
import DropdownNoFormik from '../../../../../components/form-controls/DropDownnoFormik';
import { ArmObj } from '../../../../../models/arm-obj';
import i18next from 'i18next';

type PropsType = FormikProps<AppSettingsFormValues>;

const getRuntimeStacks = (builtInStacks: ArmObj<AvailableStack>[]) => {
  const stacks: IDropdownOption[] = [];
  builtInStacks.forEach(availableStackArm => {
    const availableStack: AvailableStack = availableStackArm.properties;
    stacks.push({
      key: availableStack.name,
      text: availableStack.display,
    });
  });
  return stacks;
};

const getSelectedRuntimeStack = (builtInStacks: ArmObj<AvailableStack>[], version: string) => {
  for (const s of builtInStacks) {
    for (const majVer of s.properties.majorVersions) {
      if (majVer.runtimeVersion.toLowerCase() === version) {
        return s.name;
      }
      for (const minVer of majVer.minorVersions) {
        if (minVer.runtimeVersion.toLowerCase() === version) {
          return s.name;
        }
      }
    }
  }
  return '';
};
const getMajorVersions = (builtInStacks: ArmObj<AvailableStack>[], stack: string, t: i18next.TFunction) => {
  const linuxFxVersionOptions: IDropdownOption[] = [];

  const currentStack = builtInStacks.find(s => s.name === stack);
  if (!currentStack) {
    return [];
  }
  currentStack.properties.majorVersions.forEach(majorVersion => {
    linuxFxVersionOptions.push({
      text: majorVersion.allMinorVersionsEndOfLife
        ? t('endOfLifeTagTemplate').format(majorVersion.displayVersion)
        : majorVersion.displayVersion,
      key: majorVersion.runtimeVersion.toLowerCase(),
    });
  });

  return linuxFxVersionOptions;
};
const getSelectedMajorVersion = (builtInStacks: ArmObj<AvailableStack>[], version: string) => {
  const stack = getSelectedRuntimeStack(builtInStacks, version);
  const currentStack = builtInStacks.find(s => s.name === stack);
  if (!currentStack) {
    return '';
  }
  for (const majVer of currentStack.properties.majorVersions) {
    if (majVer.runtimeVersion.toLowerCase() === version) {
      return majVer.runtimeVersion.toLowerCase();
    }
    for (const minVer of majVer.minorVersions) {
      if (minVer.runtimeVersion.toLowerCase() === version) {
        return majVer.runtimeVersion.toLowerCase();
      }
    }
  }
  return '';
};
const getMinorVersions = (builtInStacks: ArmObj<AvailableStack>[], stack: string, majorVersion: string, t: i18next.TFunction) => {
  const linuxFxVersionOptions: IDropdownOption[] = [];
  // included already handles the case that duplicate versions are included multiple times and needs to be filtered out
  const includedAlready = new Set();
  const currentStack = builtInStacks.find(s => s.name === stack);
  if (!currentStack) {
    return [];
  }

  const currentVersion = currentStack.properties.majorVersions.find(m => m.runtimeVersion.toLowerCase() === majorVersion);
  if (!currentVersion) {
    return [];
  }

  currentVersion.minorVersions.forEach(minVer => {
    const ver = minVer.runtimeVersion.toLowerCase();
    if (!includedAlready.has(ver)) {
      includedAlready.add(ver);
      linuxFxVersionOptions.push({
        text: minVer.isEndOfLife ? t('endOfLifeTagTemplate').format(minVer.displayVersion) : minVer.displayVersion,
        key: ver,
      });
    }
  });

  if (!includedAlready.has(currentVersion.runtimeVersion.toLowerCase())) {
    linuxFxVersionOptions.unshift({
      text: currentVersion.isEndOfLife ? t('endOfLifeTagTemplate').format(currentVersion.displayVersion) : currentVersion.displayVersion,
      key: currentVersion.runtimeVersion.toLowerCase(),
    });
    includedAlready.add(currentVersion.runtimeVersion.toLowerCase());
  }

  return linuxFxVersionOptions;
};

const getSelectedMinorVersion = (builtInStacks: ArmObj<AvailableStack>[], stack: string, majorVersion: string) => {
  const currentStack = builtInStacks.find(s => s.name === stack);
  if (!currentStack) {
    return '';
  }
  const currentVersion = currentStack.properties.majorVersions.find(m => m.runtimeVersion.toLowerCase() === majorVersion);
  if (currentVersion) {
    return currentVersion.displayVersion;
  }
  return '';
};

const LinuxStacks: React.FC<PropsType> = props => {
  const { values, setFieldValue, initialValues } = props;
  const { site } = values;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const stacks = useContext(AvailableStacksContext);
  const runtimeOptions = getRuntimeStacks(stacks.value);
  const { t } = useTranslation();

  const [runtimeStack, setRuntimeStack] = useState(getSelectedRuntimeStack(stacks.value, values.config.properties.linuxFxVersion));
  const [majorVersion, setMajorVersion] = useState<string | null>(
    getSelectedMajorVersion(stacks.value, values.config.properties.linuxFxVersion)
  );

  const getInitialMinorVersion = () => {
    const initialRunTimeStack = getSelectedRuntimeStack(stacks.value, initialValues.config.properties.linuxFxVersion);
    if (!initialRunTimeStack) {
      return '';
    }
    const initialMajorVersion = getSelectedMajorVersion(stacks.value, initialValues.config.properties.linuxFxVersion);
    if (!initialMajorVersion) {
      return '';
    }
    return getSelectedMinorVersion(stacks.value, initialRunTimeStack, initialMajorVersion);
  };

  useEffect(() => {
    setRuntimeStack(getSelectedRuntimeStack(stacks.value, values.config.properties.linuxFxVersion));
    setMajorVersion(getSelectedMajorVersion(stacks.value, values.config.properties.linuxFxVersion));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.config.properties.linuxFxVersion]);
  const scenarioService = new ScenarioService(t);
  return (
    <>
      {scenarioService.checkScenario(ScenarioIds.linuxAppRuntime, { site }).status !== 'disabled' && (
        <>
          <DropdownNoFormik
            value={runtimeStack}
            dirty={runtimeStack !== getSelectedRuntimeStack(stacks.value, initialValues.config.properties.linuxFxVersion)}
            onChange={(e, newVal) => {
              const majorVersions = getMajorVersions(stacks.value, newVal.key, t);
              setRuntimeStack(newVal.key);
              if (majorVersions.length > 0) {
                const majVer = majorVersions[0];
                setMajorVersion(majVer.key as string);
                const minorVersions = getMinorVersions(stacks.value, newVal.key, majVer.key as string, t);
                setMajorVersion(majVer.key as string);
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
              value={majorVersion || ''}
              dirty={majorVersion !== getSelectedMajorVersion(stacks.value, initialValues.config.properties.linuxFxVersion)}
              onChange={(e, newVal) => {
                const minorVersions = getMinorVersions(stacks.value, runtimeStack, newVal.key, t);
                setMajorVersion(newVal.key);
                if (minorVersions.length > 0) {
                  setFieldValue('config.properties.linuxFxVersion', minorVersions[0].key);
                }
              }}
              options={getMajorVersions(stacks.value, runtimeStack, t)}
              disabled={disableAllControls}
              label={t('majorVersion')}
              id="linux-fx-version-major-version"
            />
          )}
          {majorVersion && (
            <Field
              name="config.properties.linuxFxVersion"
              dirty={getSelectedMinorVersion(stacks.value, runtimeStack, majorVersion) !== getInitialMinorVersion()}
              component={Dropdown}
              disabled={disableAllControls}
              label={t('minorVersion')}
              id="linux-fx-version-minor-version"
              options={getMinorVersions(stacks.value, runtimeStack, majorVersion, t)}
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
