import { IDropdownOption } from '@fluentui/react';
import { toInteger } from 'lodash-es';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DropdownNoFormik from '../../../../../components/form-controls/DropDownnoFormik';
import { AppStackMinorVersion, AppStackOs } from '../../../../../models/stacks/app-stacks';
import { JavaContainers as JavaContainersInterface, WebAppRuntimes, WebAppStack } from '../../../../../models/stacks/web-app-stacks';
import { PortalContext } from '../../../../../PortalContext';
import {
  checkAndGetStackEOLOrDeprecatedBanner,
  defaultDotnetCoreMajorVersion,
  filterDeprecatedWebAppStack,
  getEarlyStackMessageParameters,
  getStacksSummaryForDropdown,
  isStackVersionDeprecated,
  isStackVersionEndOfLife,
  NETFRAMEWORKVERSION5,
  RuntimeStacks,
} from '../../../../../utils/stacks-utils';
import { AppSettingsFormValues } from '../../AppSettings.types';
import { PermissionsContext, WebAppStacksContext } from '../../Contexts';
import { StackProps } from './WindowsStacks';

const DotNetStack: React.SFC<StackProps> = props => {
  const { values, initialValues } = props;

  const [earlyAccessInfoVisible, setEarlyAccessInfoVisible] = useState(false);
  const [eolStackDate, setEolStackDate] = useState<string | null | undefined>(undefined);
  const [versionDropdownValue, setVersionDropdownValue] = useState<string | undefined>(undefined);

  const { app_write, editable, saving } = useContext(PermissionsContext);
  const portalCommunicator = useContext(PortalContext);

  const disableAllControls = !app_write || !editable || saving;
  const { t } = useTranslation();
  const supportedStacks = filterDeprecatedWebAppStack(
    useContext(WebAppStacksContext),
    RuntimeStacks.dotnet,
    initialValues.config.properties.netFrameworkVersion
  );

  const dotnetStack = mergeDotnetcoreStacks(supportedStacks.find(x => x.value === RuntimeStacks.dotnet));

  const setStackBannerAndInfoMessage = () => {
    setEarlyAccessInfoVisible(false);
    setEolStackDate(undefined);

    if (dotnetStack) {
      const stackVersions = getStacksSummaryForDropdown(dotnetStack, AppStackOs.windows, t);
      const selectionVersion = (values.config.properties.netFrameworkVersion || '').toLowerCase();
      for (const stackVersion of stackVersions) {
        if (
          stackVersion.key === selectionVersion &&
          !!stackVersion.data &&
          !!stackVersion.data.stackSettings &&
          !!stackVersion.data.stackSettings.windowsRuntimeSettings
        ) {
          const settings = stackVersion.data.stackSettings.windowsRuntimeSettings;
          setEarlyAccessInfoVisible(!!settings.isEarlyAccess);

          if (isStackVersionDeprecated(settings)) {
            setEolStackDate(null);
          } else if (isStackVersionEndOfLife(settings.endOfLifeDate)) {
            setEolStackDate(settings.endOfLifeDate);
          }
          break;
        }
      }
    }
  };

  const onDotNetFrameworkChange = (e: unknown, option: IDropdownOption) => {
    if (option.key === RuntimeStacks.dotnetcore) {
      props.setFieldValue('currentlySelectedStack', option.key);
      props.setFieldValue('config.properties.netFrameworkVersion', 'v4.0');
      setVersionDropdownValue(RuntimeStacks.dotnetcore);
    } else {
      props.setFieldValue('currentlySelectedStack', RuntimeStacks.dotnet);
      props.setFieldValue('config.properties.netFrameworkVersion', option.key);
      setVersionDropdownValue(option.key as string);
    }
  };

  const setDropdownValues = (values: AppSettingsFormValues) => {
    setVersionDropdownValue(undefined);

    // NOTE (krmitta): If we see either "dotnet" or "dotnetcore" in the metadata,
    // then we look at netframeworkversion.
    // If it's 5 or higher, then we show that version.
    // If it's lower, then we look at the metadata property again.
    // If the value is "dotnetcore", then we show ".Net core (3.1, 2.1)".
    // But if it's "dotnet", then we show classic .Net.
    const netFrameworkVersion = values.config.properties.netFrameworkVersion;
    if (netFrameworkVersion) {
      try {
        const netFrameworkVersionSubstring = netFrameworkVersion.substring(1);
        const netFrameworkVersionInt = netFrameworkVersionSubstring?.split('.')[0];
        if (netFrameworkVersionInt && toInteger(netFrameworkVersionInt) >= NETFRAMEWORKVERSION5) {
          setVersionDropdownValue(netFrameworkVersion);
          return;
        }
      } catch (err) {
        portalCommunicator.log({
          action: 'Configuration',
          actionModifier: 'WindowsStacks',
          logLevel: 'error',
          data: {
            error: err,
            version: netFrameworkVersion,
          },
          resourceId: props.initialValues.site.id,
        });
      }
    }
    setDropdownValueFromMetadata(values);
  };

  const setDropdownValueFromMetadata = (values: AppSettingsFormValues) => {
    if (values.currentlySelectedStack.toLowerCase() === RuntimeStacks.dotnetcore) {
      setVersionDropdownValue(RuntimeStacks.dotnetcore);
    } else {
      setVersionDropdownValue(values.config.properties.netFrameworkVersion);
    }
  };

  useEffect(() => {
    setDropdownValues(values);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, values.config.properties.netFrameworkVersion, values.currentlySelectedStack]);
  useEffect(() => {
    setStackBannerAndInfoMessage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.config.properties.netFrameworkVersion]);

  if (!dotnetStack) {
    return null;
  }

  return (
    <>
      <DropdownNoFormik
        dirty={
          values.currentlySelectedStack !== initialValues.currentlySelectedStack ||
          values.config.properties.netFrameworkVersion !== initialValues.config.properties.netFrameworkVersion
        }
        label={t('netVersionLabel')}
        id="netValidationVersion"
        disabled={disableAllControls}
        options={getStacksSummaryForDropdown(dotnetStack, AppStackOs.windows, t)}
        onChange={onDotNetFrameworkChange}
        selectedKey={versionDropdownValue}
        {...getEarlyStackMessageParameters(earlyAccessInfoVisible, t)}
      />
      {checkAndGetStackEOLOrDeprecatedBanner(t, values.config.properties.netFrameworkVersion, eolStackDate)}
    </>
  );
};

// NOTE (krmitta) - For dotnetcore we don't store any version on the backend,
// so will be showing a single item - .NET Core under .NET stack to prevent from mis-leading the user.
// We cannot have different .NET Core versions in the dropdown since we have no way of mapping a user to a particular version.
// Thus, we are removing all the .NET Core versions from the stacks API response.
// But if we had a valid windowsRuntimeSettings for one or more .NET Core stacks,
// we simply add a default .NET Core majorVersion stack which needs to be hard-coded for this specific scenario.
const mergeDotnetcoreStacks = (stack?: WebAppStack): WebAppStack | undefined => {
  if (stack) {
    const majorVersions = [...stack.majorVersions];
    const updatedStack: WebAppStack = { ...stack };
    updatedStack.majorVersions = [];

    let validWindowsRuntimeMinorVersionForDotnetcore = 0;

    for (const majorVersion of majorVersions) {
      if (isMajorVersionValueDotnetcore(majorVersion.value.toLowerCase())) {
        if (isValidWindowsRuntimeMinorVersion(majorVersion.minorVersions)) {
          validWindowsRuntimeMinorVersionForDotnetcore += 1;
        }
      } else {
        updatedStack.majorVersions.push(majorVersion);
      }
    }

    if (validWindowsRuntimeMinorVersionForDotnetcore > 0) {
      updatedStack.majorVersions.push(defaultDotnetCoreMajorVersion);
    }

    return updatedStack;
  } else {
    return undefined;
  }
};

const isMajorVersionValueDotnetcore = (majorVersionValue: string) => {
  return majorVersionValue.startsWith('dotnetcore') || majorVersionValue === '3' || majorVersionValue === '1';
};

const isValidWindowsRuntimeMinorVersion = (minorVersions: AppStackMinorVersion<WebAppRuntimes & JavaContainersInterface>[]) => {
  for (const minorVersion of minorVersions) {
    if (minorVersion.stackSettings.windowsRuntimeSettings) {
      return true;
    }
  }
  return false;
};

export default DotNetStack;
