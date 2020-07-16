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
import { ArmObj, ArmArray } from '../../../../../models/arm-obj';
import i18next from 'i18next';

type PropsType = FormikProps<AppSettingsFormValues>;

interface VersionDetails {
  runtimeStackName: string;
  majorVersionName: string;
  majorVersionRuntime: string;
  minorVersionName: string;
  minorVersionRuntime: string;
}

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

const getMajorVersions = (builtInStacks: ArmObj<AvailableStack>[], stack: string, t: i18next.TFunction) => {
  const linuxFxVersionOptions: IDropdownOption[] = [];

  const stackToLower = (stack || '').toLowerCase();
  const currentStack = builtInStacks.find(s => !!s.name && s.name.toLowerCase() === stackToLower);
  if (!currentStack) {
    return [];
  }

  currentStack.properties.majorVersions.forEach(majorVersion => {
    linuxFxVersionOptions.push({
      text: majorVersion.allMinorVersionsEndOfLife
        ? t('endOfLifeTagTemplate').format(majorVersion.displayVersion)
        : majorVersion.displayVersion,
      key: majorVersion.runtimeVersion || '',
    });
  });

  return linuxFxVersionOptions;
};

const getMinorVersions = (builtInStacks: ArmObj<AvailableStack>[], stack: string, majorVersion: string, t: i18next.TFunction) => {
  const linuxFxVersionOptions: IDropdownOption[] = [];
  // included already handles the case that duplicate versions are included multiple times and needs to be filtered out
  const includedAlready = new Set();
  const stackToLower = (stack || '').toLowerCase();
  const currentStack = builtInStacks.find(s => !!s.name && s.name.toLowerCase() === stackToLower);
  if (!currentStack) {
    return [];
  }

  const majorVersionToLower = (majorVersion || '').toLowerCase();
  const currentVersion = currentStack.properties.majorVersions.find(
    m => !!m.runtimeVersion && m.runtimeVersion.toLowerCase() === majorVersionToLower
  );
  if (!currentVersion) {
    return [];
  }

  currentVersion.minorVersions.forEach(minVer => {
    const runtime = minVer.runtimeVersion || '';
    const runtimeToLower = runtime.toLowerCase();
    if (!includedAlready.has(runtimeToLower)) {
      includedAlready.add(runtimeToLower);
      linuxFxVersionOptions.push({
        text: minVer.isEndOfLife ? t('endOfLifeTagTemplate').format(minVer.displayVersion) : minVer.displayVersion,
        key: runtime,
      });
    }
  });

  const currentRuntime = currentVersion.runtimeVersion || '';
  const currentRuntimeToLower = currentRuntime.toLowerCase();
  if (!includedAlready.has(currentRuntimeToLower)) {
    linuxFxVersionOptions.unshift({
      text: currentVersion.isEndOfLife ? t('endOfLifeTagTemplate').format(currentVersion.displayVersion) : currentVersion.displayVersion,
      key: currentRuntime,
    });
    includedAlready.add(currentRuntimeToLower);
  }

  return linuxFxVersionOptions;
};

const getVersionDetails = (builtInStacks: ArmObj<AvailableStack>[], version: string): VersionDetails => {
  if (!!builtInStacks && !!version) {
    for (const s of builtInStacks) {
      const stackName = s.name || '';

      for (const majVer of s.properties.majorVersions) {
        const majVerRuntime = majVer.runtimeVersion || '';

        for (const minVer of majVer.minorVersions) {
          const minVerRuntime = minVer.runtimeVersion || '';

          if (minVerRuntime.toLowerCase() === version.toLowerCase()) {
            return {
              runtimeStackName: stackName,
              majorVersionName: majVer.displayVersion,
              majorVersionRuntime: majVerRuntime,
              minorVersionName: minVer.displayVersion,
              minorVersionRuntime: minVerRuntime,
            };
          }
        }

        if (majVerRuntime.toLowerCase() === version.toLowerCase()) {
          return {
            runtimeStackName: stackName,
            majorVersionName: majVer.displayVersion,
            majorVersionRuntime: majVerRuntime,
            minorVersionName: majVer.displayVersion,
            minorVersionRuntime: majVerRuntime,
          };
        }
      }
    }
  }

  return {
    runtimeStackName: '',
    majorVersionName: '',
    majorVersionRuntime: '',
    minorVersionName: '',
    minorVersionRuntime: '',
  };
};

const getSelectedRuntimeStack = (builtInStacks: ArmObj<AvailableStack>[], version: string) => {
  const versionDetails = getVersionDetails(builtInStacks, version);
  return versionDetails.runtimeStackName;
};

const getSelectedMajorVersion = (builtInStacks: ArmObj<AvailableStack>[], version: string) => {
  const versionDetails = getVersionDetails(builtInStacks, version);
  return versionDetails.majorVersionRuntime;
};

const getSelectedMinorVersion = (builtInStacks: ArmObj<AvailableStack>[], stack: string, version: string) => {
  const versionDetails = getVersionDetails(builtInStacks, version);
  return versionDetails.minorVersionRuntime;
};

const filterOutEolStacks = (builtInStacks: ArmArray<AvailableStack>, version: string): ArmArray<AvailableStack> => {
  const versionToLower = (version || '').toLowerCase();

  const stacksArm = { ...builtInStacks };
  stacksArm.value = [];

  if (!!builtInStacks && !!builtInStacks.value) {
    for (const s of builtInStacks.value) {
      const stack = {
        ...s,
        properties: { ...s.properties },
      };

      stack.properties.majorVersions = [];

      for (const majVer of s.properties.majorVersions) {
        const majorVersion = { ...majVer };
        const majorVerRuntimeSplit = (majorVersion.runtimeVersion || '').split('|');
        majorVerRuntimeSplit[0] = majorVerRuntimeSplit[0].toLowerCase();
        majorVersion.runtimeVersion = majorVerRuntimeSplit.join('|');
        majorVersion.minorVersions = [];

        for (const minVer of majVer.minorVersions) {
          const minorVersion = { ...minVer };
          const minorVerRuntimeSplit = (minorVersion.runtimeVersion || '').split('|');
          minorVerRuntimeSplit[0] = minorVerRuntimeSplit[0].toLowerCase();
          minorVersion.runtimeVersion = minorVerRuntimeSplit.join('|');

          if (
            !minorVersion.isEndOfLife ||
            (!!minorVersion.runtimeVersion && minorVersion.runtimeVersion.toLowerCase() === versionToLower)
          ) {
            majorVersion.minorVersions.push(minorVersion);
          }
        }

        if (
          !!majorVersion.minorVersions.length ||
          !majorVersion.isEndOfLife ||
          (!!majorVersion.runtimeVersion && majorVersion.runtimeVersion.toLowerCase() === versionToLower)
        ) {
          stack.properties.majorVersions.push(majorVersion);
        }
      }

      if (!!stack.properties.majorVersions.length) {
        stacksArm.value.push(stack);
      }
    }
  }

  return stacksArm;
};

const LinuxStacks: React.FC<PropsType> = props => {
  const { values, setFieldValue, initialValues } = props;
  const { site } = values;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const unfilteredStacks = useContext(AvailableStacksContext);
  const stacks = filterOutEolStacks(unfilteredStacks, initialValues.config.properties.linuxFxVersion);
  const runtimeOptions = getRuntimeStacks(stacks.value);
  const { t } = useTranslation();

  const [runtimeStack, setRuntimeStack] = useState(getSelectedRuntimeStack(stacks.value, values.config.properties.linuxFxVersion));
  const [majorVersionRuntime, setMajorVersionRuntime] = useState<string | null>(
    getSelectedMajorVersion(stacks.value, values.config.properties.linuxFxVersion)
  );

  const initialVersionDetails = getVersionDetails(stacks.value, initialValues.config.properties.linuxFxVersion);

  const stackDirty = (): boolean => (runtimeStack || '').toLowerCase() !== initialVersionDetails.runtimeStackName.toLowerCase();

  const majorVersionDirty = (): boolean =>
    (majorVersionRuntime || '').toLowerCase() !== initialVersionDetails.majorVersionRuntime.toLowerCase();

  const minorVersionDirty = (): boolean => {
    const minorVersion = getSelectedMinorVersion(stacks.value, runtimeStack, values.config.properties.linuxFxVersion);
    return (minorVersion || '').toLowerCase() !== initialVersionDetails.minorVersionRuntime.toLowerCase();
  };

  useEffect(() => {
    const selectedVersionDetails = getVersionDetails(stacks.value, values.config.properties.linuxFxVersion);
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
              const majorVersions = getMajorVersions(stacks.value, newVal.key, t);
              setRuntimeStack(newVal.key);
              if (majorVersions.length > 0) {
                const majVer = majorVersions[0];
                setMajorVersionRuntime(majVer.key as string);
                const minorVersions = getMinorVersions(stacks.value, newVal.key, majVer.key as string, t);
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
                const minorVersions = getMinorVersions(stacks.value, runtimeStack, newVal.key, t);
                setMajorVersionRuntime(newVal.key);
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
          {majorVersionRuntime && (
            <Field
              name="config.properties.linuxFxVersion"
              dirty={minorVersionDirty()}
              component={Dropdown}
              disabled={disableAllControls}
              label={t('minorVersion')}
              id="linux-fx-version-minor-version"
              options={getMinorVersions(stacks.value, runtimeStack, majorVersionRuntime, t)}
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
        learnMoreLink={Links.linuxContainersLearnMore}
        style={{ marginLeft: '1px', marginTop: '1px' }} // Not sure why but left border disappears without margin and for small windows the top also disappears
      />
    </>
  );
};
export default LinuxStacks;
