import { Field } from 'formik';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useState, useEffect, useContext } from 'react';
import Dropdown from '../../../../../components/form-controls/DropDown';
import {
  getJavaStack,
  getJavaContainers,
  getJavaMajorMinorVersion,
  getJavaContainersOptions,
  getFrameworkVersionOptions,
  getJavaMinorVersionAsDropdownOptions,
  getJavaMajorVersionAsDropdownOptions,
  getJavaContainerKey,
} from './JavaData';
import { useTranslation } from 'react-i18next';
import { PermissionsContext, WebAppStacksContext } from '../../Contexts';
import DropdownNoFormik from '../../../../../components/form-controls/DropDownnoFormik';
import { StackProps } from './WindowsStacks';
import { filterDeprecatedWebAppStack } from '../../../../../utils/stacks-utils';
import { WebAppStack } from '../../../../../models/stacks/web-app-stacks';

const JavaStack: React.SFC<StackProps> = props => {
  const [currentJavaMajorVersion, setCurrentJavaMajorVersion] = useState('');
  const [currentJavaContainer, setCurrentJavaContainer] = useState('');
  const [javaStack, setJavaStack] = useState<WebAppStack | undefined>(undefined);
  const [javaContainers, setJavaContainers] = useState<WebAppStack | undefined>(undefined);

  const { values, initialValues, setFieldValue } = props;
  const { t } = useTranslation();
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;

  const allStacks = useContext(WebAppStacksContext);

  const setJavaStacksAndContainers = () => {
    let javaStack = getJavaStack([...allStacks]);
    let javaContainers = getJavaContainers([...allStacks]);

    if (javaStack) {
      const filteredJavaStacks = filterDeprecatedWebAppStack([javaStack], 'java', initialValues.config.properties.javaVersion);
      if (filteredJavaStacks.length > 0) {
        javaStack = filteredJavaStacks[0];
      } else {
        javaStack = undefined;
      }
    }

    if (javaContainers) {
      const filteredJavaContainers = filterDeprecatedWebAppStack(
        [javaContainers],
        'javacontainers',
        initialValues.config.properties.javaVersion
      );
      if (filteredJavaContainers.length > 0) {
        javaContainers = filteredJavaContainers[0];
      } else {
        javaContainers = undefined;
      }
    }

    if (javaStack) {
      setCurrentJavaMajorVersion(getJavaMajorMinorVersion(javaStack, values.config).majorVersion);
      setJavaStack(javaStack);
    }
    if (javaContainers) {
      setCurrentJavaContainer(getJavaContainerKey(javaContainers, values.config));
      setJavaContainers(javaContainers);
    }
  };

  useEffect(() => {
    setJavaStacksAndContainers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!javaStack || !javaContainers) {
    return null;
  }

  const isJavaMajorVersionDirty = () => {
    return (
      values.currentlySelectedStack !== initialValues.currentlySelectedStack ||
      currentJavaMajorVersion !== getJavaMajorMinorVersion(javaStack, initialValues.config).majorVersion
    );
  };

  const isJavaMinorVersionDirty = () => {
    return isJavaMajorVersionDirty() || values.config.properties.javaVersion !== initialValues.config.properties.javaVersion;
  };

  const isJavaContainerDirty = () => {
    return isJavaMinorVersionDirty() || currentJavaContainer !== getJavaContainerKey(javaContainers, initialValues.config);
  };

  const isJavaContainerVersionDirty = () => {
    return isJavaContainerDirty() || values.config.properties.javaContainerVersion !== initialValues.config.properties.javaContainerVersion;
  };

  // Java Versions
  const javaMajorVersionOptions = getJavaMajorVersionAsDropdownOptions(javaStack);
  const javaMinorVersionOptions = getJavaMinorVersionAsDropdownOptions(currentJavaMajorVersion, javaStack, t);

  // container versions
  const frameworks = getJavaContainersOptions(javaContainers);
  const javaFrameworkVersionOptions = getFrameworkVersionOptions(javaContainers, currentJavaContainer, t);
  const onMajorVersionChange = (e: unknown, option: IDropdownOption) => {
    setCurrentJavaMajorVersion(option.key as string);
  };
  const onJavaContainerChange = (e: unknown, option: IDropdownOption) => {
    setFieldValue('config.properties.javaContainer', !!option.data ? option.data : '');
    setCurrentJavaContainer(option.key as string);
  };

  return (
    <div>
      <DropdownNoFormik
        label={t('javaVersionLabel')}
        dirty={isJavaMajorVersionDirty()}
        selectedKey={currentJavaMajorVersion}
        id="app-settings-java-major-verison"
        disabled={disableAllControls}
        options={javaMajorVersionOptions}
        onChange={onMajorVersionChange}
      />
      <Field
        name="config.properties.javaVersion"
        dirty={isJavaMinorVersionDirty()}
        component={Dropdown}
        fullpage
        required
        disabled={disableAllControls}
        label={t('javaMinorVersion')}
        id="app-settings-java-minor-verison"
        options={javaMinorVersionOptions}
      />
      <DropdownNoFormik
        label={t('javaWebServer')}
        dirty={isJavaContainerDirty()}
        selectedKey={currentJavaContainer}
        id="app-settings-java-container-runtime"
        disabled={disableAllControls}
        options={frameworks}
        onChange={onJavaContainerChange}
      />
      {javaFrameworkVersionOptions.length > 0 && (
        <Field
          name="config.properties.javaContainerVersion"
          dirty={isJavaContainerVersionDirty()}
          component={Dropdown}
          fullpage
          required
          disabled={disableAllControls}
          label={t('javaWebServerVersion')}
          id="app-settings-java-container-version"
          options={javaFrameworkVersionOptions}
        />
      )}
    </div>
  );
};
export default JavaStack;
