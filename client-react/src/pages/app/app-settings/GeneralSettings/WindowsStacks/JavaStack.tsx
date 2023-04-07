import { Field } from 'formik';
import React, { useState, useEffect, useContext } from 'react';
import Dropdown from '../../../../../components/form-controls/DropDown';
import {
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
import {
  filterDeprecatedWebAppStack,
  getEarlyStackMessageParameters,
  checkAndGetStackEOLOrDeprecatedBanner,
  isStackVersionDeprecated,
  isStackVersionEndOfLife,
  isJBossWarningBannerShown,
} from '../../../../../utils/stacks-utils';
import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import { MessageBarType, IDropdownOption } from '@fluentui/react';
import { Links } from '../../../../../utils/FwLinks';
import { WorkerRuntimeLanguages } from '../../../../../utils/CommonConstants';

const JavaStack: React.FC<StackProps> = props => {
  const [earlyAccessInfoVisible, setEarlyAccessInfoVisible] = useState(false);
  const [eolStackDate, setEolStackDate] = useState<string | null | undefined>(undefined);

  const { values, initialValues, setFieldValue } = props;
  const { t } = useTranslation();
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const allStacks = useContext(WebAppStacksContext);

  const disableAllControls = React.useMemo(() => !app_write || !editable || saving, [app_write, editable, saving]);

  const javaStack = React.useMemo(() => {
    const filteredStack = filterDeprecatedWebAppStack(
      allStacks.filter(stack => stack.value === WorkerRuntimeLanguages.java),
      WorkerRuntimeLanguages.java,
      initialValues.config.properties.javaVersion
    );

    return filteredStack.length > 0 ? filteredStack[0] : null;
  }, [allStacks, initialValues.config.properties.javaVersion]);

  const javaContainers = React.useMemo(() => {
    const filteredStack = filterDeprecatedWebAppStack(
      allStacks.filter(stack => stack.value === WorkerRuntimeLanguages.javaContainers),
      WorkerRuntimeLanguages.javaContainers,
      initialValues.config.properties.javaVersion
    );

    return filteredStack.length > 0 ? filteredStack[0] : null;
  }, [allStacks, initialValues.config.properties.javaVersion]);

  const isJavaMajorVersionDirty = React.useMemo(
    () =>
      values.currentlySelectedStack !== initialValues.currentlySelectedStack ||
      getJavaMajorMinorVersion(javaStack!, values.config).majorVersion !==
        getJavaMajorMinorVersion(javaStack!, initialValues.config).majorVersion,
    [
      values.config.properties.javaVersion,
      values.currentlySelectedStack,
      initialValues.currentlySelectedStack,
      initialValues.config.properties.javaVersion,
    ]
  );

  const isJavaMinorVersionDirty = React.useMemo(
    () => isJavaMajorVersionDirty || values.config.properties.javaVersion !== initialValues.config.properties.javaVersion,
    [initialValues.config.properties.javaVersion, isJavaMajorVersionDirty, values.config.properties.javaVersion]
  );

  const isJavaContainerDirty = React.useMemo(
    () => getJavaContainerKey(javaContainers!, values.config) !== getJavaContainerKey(javaContainers!, initialValues.config),
    [
      values.config.properties.javaContainer,
      values.config.properties.javaContainerVersion,
      initialValues.config.properties.javaContainer,
      initialValues.config.properties.javaContainerVersion,
    ]
  );

  const isJavaContainerVersionDirty = React.useMemo(
    () => isJavaContainerDirty || values.config.properties.javaContainerVersion !== initialValues.config.properties.javaContainerVersion,
    [isJavaContainerDirty, values.config.properties.javaContainerVersion, initialValues.config.properties.javaContainerVersion]
  );

  const selectedContainerKey = React.useMemo(() => getJavaContainerKey(javaContainers!, values.config), [
    values.config.properties.javaContainer,
    values.config.properties.javaContainerVersion,
    javaContainers,
  ]);

  const selectedMajorVersion = React.useMemo(() => getJavaMajorMinorVersion(javaStack!, values.config).majorVersion, [
    values.config.properties.javaVersion,
    javaStack,
  ]);

  const onJavaContainerChange = React.useCallback(
    (_, option: IDropdownOption) => {
      const containerVersionOptions = getFrameworkVersionOptions(javaContainers!, option.key as string, t);

      setFieldValue('config.properties.javaContainer', option.data ?? '');
      setFieldValue(
        'config.properties.javaContainerVersion',
        containerVersionOptions.length > 0 ? (containerVersionOptions[0].key as string) : ''
      );
    },
    [setFieldValue, javaContainers, t]
  );

  const onMajorVersionChange = React.useCallback(
    (_, option: IDropdownOption) => {
      const minorVersionOptions = getJavaMinorVersionAsDropdownOptions(option.key as string, javaStack!, t);
      setFieldValue('config.properties.javaVersion', minorVersionOptions.length > 0 ? (minorVersionOptions[0].key as string) : '');
    },
    [setFieldValue, javaStack, t]
  );

  useEffect(() => {
    if (javaStack) {
      const currentMajorVersion = getJavaMajorMinorVersion(javaStack, values.config).majorVersion;
      setEarlyAccessInfoVisible(false);
      setEolStackDate(undefined);

      if (currentMajorVersion) {
        if (currentMajorVersion) {
          const stackVersions = getJavaMinorVersionAsDropdownOptions(currentMajorVersion, javaStack, t);
          const selectionVersion = (values.config.properties.javaVersion ?? '').toLowerCase();

          for (const stackVersion of stackVersions) {
            const windowsRuntimeSettings = stackVersion.data?.stackSettings?.windowsRuntimeSettings;

            if (stackVersion.key === selectionVersion && windowsRuntimeSettings) {
              setEarlyAccessInfoVisible(!!windowsRuntimeSettings.isEarlyAccess);

              if (isStackVersionDeprecated(windowsRuntimeSettings)) {
                setEolStackDate(null);
              } else if (isStackVersionEndOfLife(windowsRuntimeSettings.endOfLifeDate)) {
                setEolStackDate(windowsRuntimeSettings.endOfLifeDate);
              }
              return;
            }
          }
        }
      }
    }
  }, [values.config.properties.javaVersion, setEarlyAccessInfoVisible, setEolStackDate, javaStack]);

  if (!javaStack || !javaContainers) {
    return null;
  }

  return (
    <div>
      <DropdownNoFormik
        label={t('javaVersionLabel')}
        dirty={isJavaMajorVersionDirty}
        selectedKey={selectedMajorVersion}
        id="app-settings-java-major-verison"
        disabled={disableAllControls}
        options={getJavaMajorVersionAsDropdownOptions(javaStack)}
        onChange={onMajorVersionChange}
      />
      <Field
        name="config.properties.javaVersion"
        dirty={isJavaMinorVersionDirty}
        component={Dropdown}
        fullpage
        required
        disabled={disableAllControls}
        label={t('javaMinorVersion')}
        id="app-settings-java-minor-verison"
        options={getJavaMinorVersionAsDropdownOptions(selectedMajorVersion, javaStack, t)}
        {...getEarlyStackMessageParameters(earlyAccessInfoVisible, t)}
      />
      {checkAndGetStackEOLOrDeprecatedBanner(t, values.config.properties.javaVersion, eolStackDate)}
      <DropdownNoFormik
        label={t('javaWebServer')}
        dirty={isJavaContainerDirty}
        selectedKey={selectedContainerKey}
        id="app-settings-java-container-runtime"
        disabled={disableAllControls}
        options={getJavaContainersOptions(javaContainers)}
        onChange={onJavaContainerChange}
      />
      <Field
        name="config.properties.javaContainerVersion"
        dirty={isJavaContainerVersionDirty}
        component={Dropdown}
        fullpage
        required
        disabled={disableAllControls}
        label={t('javaWebServerVersion')}
        id="app-settings-java-container-version"
        options={getFrameworkVersionOptions(javaContainers, selectedContainerKey, t)}
      />
      {isJBossWarningBannerShown(values.config.properties.javaVersion, initialValues.config.properties.javaVersion) && (
        <CustomBanner
          type={MessageBarType.warning}
          message={t('switchToJbossWarningBaner')}
          learnMoreLink={Links.jbossAdditionalCostLearnMore}
        />
      )}
    </div>
  );
};
export default JavaStack;
