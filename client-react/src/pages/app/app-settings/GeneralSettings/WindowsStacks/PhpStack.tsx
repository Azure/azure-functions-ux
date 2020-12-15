import { Field } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { PermissionsContext, WebAppStacksContext } from '../../Contexts';
import {
  filterDeprecatedWebAppStack,
  getEarlyStackMessageParameters,
  getEOLOrDeprecatedBanner,
  getStacksSummaryForDropdown,
  isStackVersionDeprecated,
  isStackVersionEndOfLife,
} from '../../../../../utils/stacks-utils';
import { AppStackOs } from '../../../../../models/stacks/app-stacks';
import { StackProps } from './WindowsStacks';

const PhpStack: React.SFC<StackProps> = props => {
  const { values, initialValues } = props;
  const { t } = useTranslation();

  const [earlyAccessInfoVisible, setEarlyAccessInfoVisible] = useState(false);
  const [eolStackDate, setEolStackDate] = useState<string | null | undefined>(undefined);

  const { app_write, editable, saving } = useContext(PermissionsContext);

  const disableAllControls = !app_write || !editable || saving;
  const supportedStacks = filterDeprecatedWebAppStack(
    useContext(WebAppStacksContext),
    'php',
    initialValues.config.properties.phpVersion || ''
  );

  const phpStack = supportedStacks.find(x => x.value === 'php');

  const setStackBannerAndInfoMessage = () => {
    setEarlyAccessInfoVisible(false);
    setEolStackDate(undefined);

    if (!!phpStack) {
      const stackVersions = getStacksSummaryForDropdown(phpStack, AppStackOs.windows, t);
      const selectionVersion = (values.config.properties.phpVersion || '').toLowerCase();
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

  if (!phpStack) {
    return null;
  }
  const phpVersions = getStacksSummaryForDropdown(phpStack, AppStackOs.windows, t);
  phpVersions.push({ key: '', text: t('off') });

  return (
    <>
      <Field
        name="config.properties.phpVersion"
        dirty={
          values.currentlySelectedStack !== initialValues.currentlySelectedStack ||
          values.config.properties.phpVersion !== initialValues.config.properties.phpVersion
        }
        component={Dropdown}
        fullpage
        label={t('phpVersion')}
        id="phpVersion"
        disabled={disableAllControls}
        options={phpVersions}
        {...getEarlyStackMessageParameters(earlyAccessInfoVisible, t)}
      />
      {getEOLOrDeprecatedBanner(t, values.config.properties.phpVersion || '', eolStackDate)}
    </>
  );
};

export default PhpStack;
