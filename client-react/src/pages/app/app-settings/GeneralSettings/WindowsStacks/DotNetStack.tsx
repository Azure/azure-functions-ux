import { Field } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { PermissionsContext, WebAppStacksContext } from '../../Contexts';
import {
  filterDeprecatedWebAppStack,
  getEarlyStackMessageParameters,
  getStacksSummaryForDropdown,
  RuntimeStacks,
  isStackVersionDeprecated,
  isStackVersionEndOfLife,
  getEOLOrDeprecatedBanner,
} from '../../../../../utils/stacks-utils';
import { AppStackOs } from '../../../../../models/stacks/app-stacks';
import { StackProps } from './WindowsStacks';

const DotNetStack: React.SFC<StackProps> = props => {
  const { values, initialValues } = props;

  const [earlyAccessInfoVisible, setEarlyAccessInfoVisible] = useState(false);
  const [eolStackDate, setEolStackDate] = useState<string | null | undefined>(undefined);

  const { app_write, editable, saving } = useContext(PermissionsContext);

  const disableAllControls = !app_write || !editable || saving;
  const { t } = useTranslation();
  const supportedStacks = filterDeprecatedWebAppStack(
    useContext(WebAppStacksContext),
    RuntimeStacks.aspnet,
    initialValues.config.properties.netFrameworkVersion
  );

  const aspNetStack = supportedStacks.find(x => x.value === RuntimeStacks.aspnet);

  const setStackBannerAndInfoMessage = () => {
    setEarlyAccessInfoVisible(false);
    setEolStackDate(undefined);

    if (!!aspNetStack) {
      const stackVersions = getStacksSummaryForDropdown(aspNetStack, AppStackOs.windows, t);
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

  useEffect(() => {
    setStackBannerAndInfoMessage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.config.properties.linuxFxVersion]);

  if (!aspNetStack) {
    return null;
  }

  return (
    <>
      <Field
        name="config.properties.netFrameworkVersion"
        dirty={
          values.currentlySelectedStack !== initialValues.currentlySelectedStack ||
          values.config.properties.netFrameworkVersion !== initialValues.config.properties.netFrameworkVersion
        }
        component={Dropdown}
        fullpage
        label={t('netFrameWorkVersionLabel')}
        id="netValidationVersion"
        disabled={disableAllControls}
        options={getStacksSummaryForDropdown(aspNetStack, AppStackOs.windows, t)}
        {...getEarlyStackMessageParameters(earlyAccessInfoVisible, t)}
      />
      {getEOLOrDeprecatedBanner(t, values.config.properties.netFrameworkVersion, eolStackDate)}
    </>
  );
};
export default DotNetStack;
