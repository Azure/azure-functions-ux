import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';

import { IDropdownOption } from '@fluentui/react';

import DropdownNoFormik from '../../../../../components/form-controls/DropDownnoFormik';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import { Links } from '../../../../../utils/FwLinks';
import { RuntimeStacks } from '../../../../../utils/stacks-utils';
import { AppSettingsFormValues, FormAppSetting } from '../../AppSettings.types';
import { addOrUpdateFormAppSetting } from '../../AppSettingsFormData';
import { PermissionsContext, WebAppStacksContext } from '../../Contexts';

import DotNetStack from './DotNetStack';
import JavaStack from './JavaStack';
import PhpStack from './PhpStack';
import PythonStack from './PythonStack';

export type StackProps = FormikProps<AppSettingsFormValues>;

const WindowsStacks: React.FC<StackProps> = props => {
  const { values, initialValues, setFieldValue } = props;
  const { t } = useTranslation();
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const readonly = !app_write;
  const disableAllControls = readonly || !editable || saving;
  const javaSelected = values.currentlySelectedStack === RuntimeStacks.java;
  const showNonJavaAnyway = readonly && !javaSelected;

  const [stackDropdownValue, setStackDropdownValue] = useState<string | undefined>(undefined);

  const supportedStacks = useContext(WebAppStacksContext);

  const filterStackOptions = (): IDropdownOption[] => {
    return supportedStacks
      .filter(stack => {
        const stackValue = stack.value.toLocaleLowerCase();
        // NOTE(krmitta): General Settings for Windows web app stacks only supports dotnet, python, php and java for now.
        // I will be adding the node support at a later time.
        return (
          stackValue === RuntimeStacks.java ||
          stackValue === RuntimeStacks.php ||
          stackValue === RuntimeStacks.python ||
          stackValue === RuntimeStacks.dotnet ||
          stackValue === RuntimeStacks.node
        );
      })
      .map(stack => {
        return {
          key: stack.value.toLowerCase(),
          text: stack.displayText,
        };
      });
  };

  const setStackDropdownValues = (values: AppSettingsFormValues) => {
    setStackDropdownValue(
      values.currentlySelectedStack.toLowerCase() === RuntimeStacks.dotnetcore ? RuntimeStacks.dotnet : values.currentlySelectedStack
    );
  };

  const onStackDropdownChange = (e: any, option: IDropdownOption) => {
    const selectedDropdownValue = option.key as string;
    setStackDropdownValue(selectedDropdownValue);
    setFieldValue('currentlySelectedStack', selectedDropdownValue);

    // NOTE(krmitta): We need to set the node version if the user switches to node
    if (
      !values.appSettings.find(
        appSetting => appSetting.name.toLowerCase() === CommonConstants.AppSettingNames.websiteNodeDefaultVersion.toLocaleLowerCase()
      ) &&
      selectedDropdownValue?.toLowerCase() === RuntimeStacks.node &&
      app_write
    ) {
      const nodeStackResponse = supportedStacks.find(stack => stack.value.toLocaleLowerCase() === RuntimeStacks.node);

      if (nodeStackResponse) {
        for (const majorVersion of nodeStackResponse.majorVersions) {
          for (const minorVersion of majorVersion.minorVersions) {
            const version = minorVersion.stackSettings.windowsRuntimeSettings?.runtimeVersion;
            if (version) {
              let appSettings: FormAppSetting[] = [...values.appSettings];

              appSettings = addOrUpdateFormAppSetting(
                values.appSettings,
                CommonConstants.AppSettingNames.websiteNodeDefaultVersion,
                version
              );
              setFieldValue('appSettings', appSettings);

              return;
            }
          }
        }
      }
    }
  };

  const getInfoBubleObject = useCallback(() => {
    if (!stackDropdownValue) {
      return {
        infoBubbleMessage: t('stackInfoMessage'),
      };
    } else if (stackDropdownValue === RuntimeStacks.node) {
      return {
        infoBubbleMessage: t('nodeStackLearnMore').format(CommonConstants.AppSettingNames.websiteNodeDefaultVersion),
        learnMoreLink: Links.configureNodeLearnMore,
      };
    } else {
      return {};
    }
  }, [stackDropdownValue]);

  useEffect(() => {
    setStackDropdownValues(values);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, values.currentlySelectedStack]);
  return (
    <>
      <DropdownNoFormik
        dirty={values.currentlySelectedStack !== initialValues.currentlySelectedStack}
        disabled={disableAllControls}
        options={filterStackOptions()}
        label={t('stack')}
        id="app-settings-stack-dropdown"
        onChange={onStackDropdownChange}
        selectedKey={stackDropdownValue}
        {...getInfoBubleObject()}
      />
      {values.currentlySelectedStack === RuntimeStacks.dotnet ||
      values.currentlySelectedStack === RuntimeStacks.dotnetcore ||
      showNonJavaAnyway ? (
        <DotNetStack {...props} />
      ) : null}
      {values.currentlySelectedStack === RuntimeStacks.php || showNonJavaAnyway ? <PhpStack {...props} /> : null}
      {values.currentlySelectedStack === RuntimeStacks.python || showNonJavaAnyway ? <PythonStack {...props} /> : null}
      {javaSelected ? <JavaStack {...props} /> : null}
    </>
  );
};

export default WindowsStacks;
