import React, { useState, useEffect, useContext } from 'react';
import { StackProps } from '../WindowsStacks/WindowsStacks';
import { WebAppStacksContext, PermissionsContext } from '../../Contexts';
import { LINUXJAVASTACKKEY, LINUXJAVACONTAINERKEY } from './LinuxStacks.data';
import { AppStackMinorVersion } from '../../../../../models/stacks/app-stacks';
import { IDropdownOption } from 'office-ui-fabric-react';
import DropdownNoFormik from '../../../../../components/form-controls/DropDownnoFormik';
import { Field } from 'formik';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { useTranslation } from 'react-i18next';
import { getEarlyStackMessageParameters, getMinorVersionText } from '../../../../../utils/stacks-utils';

// NOTE(krmitta): These keys should be similar to what is being returned from the backend
const JAVA8KEY = '8';
const JAVA11KEY = '11';

interface JavaStackValues {
  majorVersion: string;
  containerKey: string;
  containerVersion: string;
}

const JavaStack: React.SFC<StackProps> = props => {
  const { values, setFieldValue, initialValues } = props;
  const [currentMajorVersion, setCurrentMajorVersion] = useState<string | undefined>(undefined);
  const [currentContainerKey, setCurrentContainerKey] = useState<string | undefined>(undefined);
  const [currentContainerDropdownOptions, setCurrentContainerDropdownOptions] = useState<IDropdownOption[]>([]);
  const [currentContainerVersionDropdownOptions, setCurrentContainerVersionDropdownOptions] = useState<IDropdownOption[]>([]);
  const [earlyAccessInfoVisible, setEarlyAccessInfoVisible] = useState(false);

  const { t } = useTranslation();
  const stacks = useContext(WebAppStacksContext);
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const javaStack = stacks.find(stack => stack.value === LINUXJAVASTACKKEY);
  const javaContainer = stacks.find(stack => stack.value === LINUXJAVACONTAINERKEY);

  const getJavaMajorVersionDropdownOptions = (): IDropdownOption[] => {
    const options: IDropdownOption[] = [];
    if (javaStack) {
      javaStack.majorVersions.forEach(javaStackMajorVersion => {
        let linuxRuntimeCount = 0;
        javaStackMajorVersion.minorVersions.forEach(javaStackMinorVersion => {
          if (javaStackMinorVersion.stackSettings.linuxRuntimeSettings) {
            linuxRuntimeCount += 1;
          }
        });
        if (linuxRuntimeCount > 0) {
          options.push({
            key: javaStackMajorVersion.value,
            text: javaStackMajorVersion.displayText,
          });
        }
      });
    }
    return options;
  };

  const getJavaContainerDropdownOptionsForSelectedMajorVersion = (majorVersion: string): IDropdownOption[] => {
    const options: IDropdownOption[] = [];
    if (javaContainer) {
      javaContainer.majorVersions.forEach(javaContainerMajorVersion => {
        const containerMinorVersions: AppStackMinorVersion<any>[] = [];
        javaContainerMajorVersion.minorVersions.forEach(javaContainerMinorVersion => {
          const containerSettings = javaContainerMinorVersion.stackSettings.linuxContainerSettings;
          if (
            containerSettings &&
            ((majorVersion === JAVA8KEY && !!containerSettings.java8Runtime) ||
              (majorVersion === JAVA11KEY && !!containerSettings.java11Runtime))
          ) {
            containerMinorVersions.push(javaContainerMinorVersion);
          }
        });
        if (containerMinorVersions.length > 0) {
          options.push({
            key: javaContainerMajorVersion.value,
            text: javaContainerMajorVersion.displayText,
          });
        }
      });
    }
    return options;
  };

  const getJavaContainerVersionDropdownOptionsForSelectedJavaContainer = (
    majorVersion: string,
    javaContainerKey: string
  ): IDropdownOption[] => {
    const options: IDropdownOption[] = [];
    if (javaContainer) {
      javaContainer.majorVersions
        .filter(javaContainerMajorVersion => javaContainerMajorVersion.value === javaContainerKey)
        .forEach(javaContainerMajorVersion => {
          javaContainerMajorVersion.minorVersions.forEach(javaContainerMinorVersion => {
            const containerSettings = javaContainerMinorVersion.stackSettings.linuxContainerSettings;
            if (containerSettings) {
              if (majorVersion === JAVA8KEY && !!containerSettings.java8Runtime) {
                options.push({
                  key: containerSettings.java8Runtime.toLowerCase(),
                  text: getMinorVersionText(
                    javaContainerMinorVersion.displayText,
                    t,
                    javaContainerMinorVersion.stackSettings.linuxContainerSettings
                  ),
                  data: containerSettings,
                });
              } else if (majorVersion === JAVA11KEY && !!containerSettings.java11Runtime) {
                options.push({
                  key: containerSettings.java11Runtime.toLowerCase(),
                  text: getMinorVersionText(
                    javaContainerMinorVersion.displayText,
                    t,
                    javaContainerMinorVersion.stackSettings.linuxContainerSettings
                  ),
                  data: containerSettings,
                });
              }
            }
          });
        });
    }
    return options;
  };

  const getSelectedValues = (linuxFxVersion: string) => {
    const values: JavaStackValues = { majorVersion: '', containerKey: '', containerVersion: '' };
    if (javaContainer) {
      javaContainer.majorVersions.forEach(javaContainerMajorVersion => {
        javaContainerMajorVersion.minorVersions.forEach(javaContainerMinorVersion => {
          const containerSettings = javaContainerMinorVersion.stackSettings.linuxContainerSettings;
          if (containerSettings) {
            if (containerSettings.java8Runtime && containerSettings.java8Runtime.toLowerCase() === linuxFxVersion.toLowerCase()) {
              values.majorVersion = JAVA8KEY;
              values.containerKey = javaContainerMajorVersion.value;
              values.containerVersion = containerSettings.java8Runtime;
            } else if (containerSettings.java11Runtime && containerSettings.java11Runtime.toLowerCase() === linuxFxVersion.toLowerCase()) {
              values.majorVersion = JAVA11KEY;
              values.containerKey = javaContainerMajorVersion.value;
              values.containerVersion = containerSettings.java11Runtime;
            }
          }
        });
      });
    }
    return values;
  };

  const setInitialData = () => {
    let majorVersionDropdownOptions: IDropdownOption[] = [];
    let containerKeyDropdownOptions: IDropdownOption[] = [];
    let containerVersionDropdownOptions: IDropdownOption[] = [];
    const selectedValues = getSelectedValues(values.config.properties.linuxFxVersion);
    majorVersionDropdownOptions = getJavaMajorVersionDropdownOptions();
    const majorVersion = selectedValues.majorVersion
      ? selectedValues.majorVersion
      : majorVersionDropdownOptions.length > 0
      ? (majorVersionDropdownOptions[0].key as string)
      : undefined;

    if (majorVersion) {
      containerKeyDropdownOptions = getJavaContainerDropdownOptionsForSelectedMajorVersion(majorVersion);
      const containerKey = selectedValues.containerKey
        ? selectedValues.containerKey
        : containerKeyDropdownOptions.length > 0
        ? (containerKeyDropdownOptions[0].key as string)
        : undefined;

      if (containerKey) {
        containerVersionDropdownOptions = getJavaContainerVersionDropdownOptionsForSelectedJavaContainer(majorVersion, containerKey);
        const containerVersion = selectedValues.containerVersion
          ? selectedValues.containerVersion
          : containerVersionDropdownOptions.length > 0
          ? (containerVersionDropdownOptions[0].key as string)
          : undefined;

        if (containerVersion && containerVersion.toLowerCase() !== values.config.properties.linuxFxVersion.toLowerCase()) {
          setFieldValue('config.properties.linuxFxVersion', containerVersion);
        }

        setCurrentContainerKey(containerKey);
      }

      setCurrentMajorVersion(majorVersion);
    }

    setCurrentContainerDropdownOptions(containerKeyDropdownOptions);
    setCurrentContainerVersionDropdownOptions(containerVersionDropdownOptions);
  };

  const onMajorVersionChange = (newMajorVersion: string) => {
    setCurrentMajorVersion(newMajorVersion);
    const containerDropdownOptions = getJavaContainerDropdownOptionsForSelectedMajorVersion(newMajorVersion);
    setCurrentContainerDropdownOptions(containerDropdownOptions);
    if (containerDropdownOptions.length > 0) {
      onContainerKeyChange(newMajorVersion, containerDropdownOptions[0].key as string);
    }
  };

  const onContainerKeyChange = (newMajorVersion: string, newContainerKey: string) => {
    if (newContainerKey !== currentContainerKey) {
      const containerVersionDropdownOptions = getJavaContainerVersionDropdownOptionsForSelectedJavaContainer(
        newMajorVersion,
        newContainerKey
      );
      setCurrentContainerVersionDropdownOptions(containerVersionDropdownOptions);
      if (containerVersionDropdownOptions.length > 0) {
        setFieldValue('config.properties.linuxFxVersion', containerVersionDropdownOptions[0].key);
      }
      setCurrentContainerKey(newContainerKey);
    }
  };

  const isMajorVersionDirty = () => {
    const initialSelectedValues = getSelectedValues(initialValues.config.properties.linuxFxVersion);
    return initialSelectedValues.majorVersion !== currentMajorVersion;
  };

  const isContainerKeyDirty = () => {
    const initialSelectedValues = getSelectedValues(initialValues.config.properties.linuxFxVersion);
    return initialSelectedValues.containerKey !== currentContainerKey;
  };

  const isContainerVersionDirty = () => {
    return initialValues.config.properties.linuxFxVersion !== values.config.properties.linuxFxVersion;
  };

  const setEarlyAccessInfoMessage = () => {
    setEarlyAccessInfoVisible(false);

    if (currentMajorVersion && currentContainerKey) {
      const containerVersions = getJavaContainerVersionDropdownOptionsForSelectedJavaContainer(currentMajorVersion, currentContainerKey);
      const selectedMinorVersion = values.config.properties.linuxFxVersion.toLowerCase();
      for (const containerVersion of containerVersions) {
        if (containerVersion.key === selectedMinorVersion && containerVersion.data && containerVersion.data.isEarlyAccess) {
          setEarlyAccessInfoVisible(true);
          return;
        }
      }
    }
  };

  useEffect(() => {
    setInitialData();
    setEarlyAccessInfoMessage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.config.properties.linuxFxVersion]);

  if (!currentMajorVersion || !currentContainerKey || !javaStack || !javaContainer) {
    return null;
  }

  return (
    <>
      <DropdownNoFormik
        selectedKey={currentMajorVersion}
        dirty={isMajorVersionDirty()}
        onChange={(e, newVal) => onMajorVersionChange(newVal.key)}
        options={getJavaMajorVersionDropdownOptions()}
        disabled={disableAllControls}
        label={t('majorVersion')}
        id="linux-fx-java-major-version"
      />
      {currentMajorVersion && currentContainerDropdownOptions.length > 0 && (
        <DropdownNoFormik
          selectedKey={currentContainerKey || ''}
          dirty={isContainerKeyDirty()}
          onChange={(e, newVal) => onContainerKeyChange(currentMajorVersion, newVal.key)}
          options={currentContainerDropdownOptions}
          disabled={disableAllControls}
          label={t('javaWebServer')}
          id="linux-fx-version-java-container-major-version"
        />
      )}
      {currentContainerKey && currentContainerVersionDropdownOptions.length > 0 && (
        <Field
          name="config.properties.linuxFxVersion"
          dirty={isContainerVersionDirty()}
          component={Dropdown}
          disabled={disableAllControls}
          label={t('javaWebServerVersion')}
          id="linux-fx-version-java-container-minor-version"
          options={currentContainerVersionDropdownOptions}
          {...getEarlyStackMessageParameters(earlyAccessInfoVisible, t)}
        />
      )}
    </>
  );
};

export default JavaStack;
