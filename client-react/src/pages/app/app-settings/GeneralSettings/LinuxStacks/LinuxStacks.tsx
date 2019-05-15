import { Field, FormikProps } from 'formik';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useContext, useState, useEffect } from 'react';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { AvailableStack } from '../../../../../models/available-stacks';
import { ArmObj } from '../../../../../models/WebAppModels';
import { AppSettingsFormValues } from '../../AppSettings.types';
import { AvailableStacksContext, PermissionsContext } from '../../Contexts';
import TextField from '../../../../../components/form-controls/TextField';
import { useTranslation } from 'react-i18next';
import { ScenarioService } from '../../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../../utils/scenario-checker/scenario-ids';
import { Links } from '../../../../../utils/FwLinks';
import DropdownNoFormik from '../../../../../components/form-controls/DropDownnoFormik';

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
  const map = {};

  builtInStacks.forEach(s => {
    s.properties.majorVersions.forEach(majVer => {
      map[majVer.runtimeVersion.toLowerCase()] = s.name;
      majVer.minorVersions.forEach(minVer => {
        map[minVer.runtimeVersion.toLowerCase()] = s.name;
      });
    });
  });
  return map[version];
};
const getMajorVersions = (builtInStacks: ArmObj<AvailableStack>[], stack: string) => {
  const linuxFxVersionOptions: IDropdownOption[] = [];

  const currentStack = builtInStacks.find(s => s.name === stack);
  if (!currentStack) {
    return [];
  }
  currentStack.properties.majorVersions.forEach(majorVersion => {
    linuxFxVersionOptions.push({
      text: majorVersion.displayVersion,
      key: majorVersion.runtimeVersion.toLowerCase(),
    });
  });

  return linuxFxVersionOptions;
};
const getSelectedMajorVersion = (builtInStacks: ArmObj<AvailableStack>[], version: string) => {
  const map = {};

  const stack = getSelectedRuntimeStack(builtInStacks, version);
  const currentStack = builtInStacks.find(s => s.name === stack);
  if (!currentStack) {
    return null;
  }
  currentStack.properties.majorVersions.forEach(majVer => {
    map[majVer.runtimeVersion.toLowerCase()] = majVer.runtimeVersion.toLowerCase();
    majVer.minorVersions.forEach(minVer => {
      map[minVer.runtimeVersion.toLowerCase()] = majVer.runtimeVersion.toLowerCase();
    });
  });
  return map[version];
};
const getMinorVersions = (builtInStacks: ArmObj<AvailableStack>[], stack: string, majorVersion: string) => {
  const linuxFxVersionOptions: IDropdownOption[] = [];
  const includedAlready = new Set();
  const currentStack = builtInStacks.find(s => s.name === stack);
  if (!currentStack) {
    return [];
  }
  const currentVersion = currentStack.properties.majorVersions.find(m => m.runtimeVersion.toLowerCase() === majorVersion);
  if (!currentVersion) {
    return [];
  }
  linuxFxVersionOptions.push({
    text: currentVersion.displayVersion,
    key: currentVersion.runtimeVersion.toLowerCase(),
  });
  includedAlready.add(currentVersion.runtimeVersion.toLowerCase());
  currentVersion.minorVersions.forEach(minVer => {
    const ver = minVer.runtimeVersion.toLowerCase();
    if (!includedAlready.has(ver)) {
      includedAlready.add(ver);
      linuxFxVersionOptions.push({
        text: minVer.displayVersion,
        key: ver,
      });
    }
  });

  return linuxFxVersionOptions;
};
const LinuxStacks: React.FC<PropsType> = props => {
  const { values, setFieldValue } = props;
  const { site } = values;
  const { app_write, editable } = useContext(PermissionsContext);
  const stacks = useContext(AvailableStacksContext);
  const runtimeOptions = getRuntimeStacks(stacks.value);
  const { t } = useTranslation();

  const [runtimeStack, setRuntimeStack] = useState(getSelectedRuntimeStack(stacks.value, values.config.properties.linuxFxVersion));
  const [majorVersion, setMajorVersion] = useState<string | null>(
    getSelectedMajorVersion(stacks.value, values.config.properties.linuxFxVersion)
  );
  useEffect(() => {
    setRuntimeStack(getSelectedRuntimeStack(stacks.value, values.config.properties.linuxFxVersion));
    setMajorVersion(getSelectedMajorVersion(stacks.value, values.config.properties.linuxFxVersion));
  }, [values.config.properties.linuxFxVersion]);
  const scenarioService = new ScenarioService(t);
  return (
    <>
      {scenarioService.checkScenario(ScenarioIds.linuxAppRuntime, { site }).status !== 'disabled' && (
        <>
          <DropdownNoFormik
            value={runtimeStack}
            onChange={(e, newVal) => {
              const majorVersions = getMajorVersions(stacks.value, newVal.key);
              setRuntimeStack(newVal.key);
              if (majorVersions.length > 0) {
                const majVer = majorVersions[0];
                setMajorVersion(majVer.key as string);
                const minorVersions = getMinorVersions(stacks.value, newVal.key, majVer.key as string);
                setMajorVersion(majVer.key as string);
                if (minorVersions.length > 0) {
                  setFieldValue('config.properties.linuxFxVersion', minorVersions[0].key);
                }
              }
            }}
            options={runtimeOptions}
            disabled={!app_write || !editable}
            label={t('stack')}
            id="linux-fx-version-runtime"
          />
          {runtimeStack && (
            <DropdownNoFormik
              value={majorVersion || ''}
              onChange={(e, newVal) => {
                const minorVersions = getMinorVersions(stacks.value, runtimeStack, newVal.key);
                setMajorVersion(newVal.key);
                if (minorVersions.length > 0) {
                  setFieldValue('config.properties.linuxFxVersion', minorVersions[0].key);
                }
              }}
              options={getMajorVersions(stacks.value, runtimeStack)}
              disabled={!app_write || !editable}
              label={t('majorVersion')}
              id="linux-fx-version-major-version"
            />
          )}
          {majorVersion && (
            <Field
              name="config.properties.linuxFxVersion"
              component={Dropdown}
              disabled={!app_write || !editable}
              label={t('minorVersion')}
              id="linux-fx-version-minor-version"
              options={getMinorVersions(stacks.value, runtimeStack, majorVersion)}
            />
          )}
        </>
      )}
      <Field
        name="config.properties.appCommandLine"
        component={TextField}
        disabled={!app_write || !editable}
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
