import { Field } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { FormApi, FormState } from '../../AppSettings.types';
import { PermissionsContext, WebAppStacksContext } from '../../Contexts';
import { Links } from '../../../../../utils/FwLinks';
import {
  filterDeprecatedWebAppStack,
  getEarlyStackMessageParameters,
  checkAndGetStackEOLOrDeprecatedBanner,
  getStacksSummaryForDropdown,
  isStackVersionDeprecated,
  isStackVersionEndOfLife,
  RuntimeStacks,
} from '../../../../../utils/stacks-utils';
import { AppStackOs } from '../../../../../models/stacks/app-stacks';
import { StackProps } from './WindowsStacks';

export interface OwnProps {
  formState: FormState;
  formApi: FormApi;
}

const PythonStack: React.StatelessComponent<StackProps> = props => {
  const { values, initialValues } = props;

  const { app_write, editable, saving } = useContext(PermissionsContext);

  const [earlyAccessInfoVisible, setEarlyAccessInfoVisible] = useState(false);
  const [eolStackDate, setEolStackDate] = useState<string | null | undefined>(undefined);

  const disableAllControls = !app_write || !editable || saving;
  const { t } = useTranslation();
  const supportedStacks = filterDeprecatedWebAppStack(
    useContext(WebAppStacksContext),
    RuntimeStacks.python,
    initialValues.config.properties.pythonVersion || ''
  );

  const pythonStack = supportedStacks.find(x => x.value === RuntimeStacks.python);

  const setStackBannerAndInfoMessage = () => {
    setEarlyAccessInfoVisible(false);
    setEolStackDate(undefined);

    if (!!pythonStack) {
      const stackVersions = getStacksSummaryForDropdown(pythonStack, AppStackOs.windows, t);
      const selectionVersion = (values.config.properties.pythonVersion || '').toLowerCase();
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

  if (!pythonStack) {
    return null;
  }
  const pythonVersions = getStacksSummaryForDropdown(pythonStack, AppStackOs.windows, t);
  pythonVersions.push({ key: '', text: t('off') });

  return (
    <>
      <Field
        name="config.properties.pythonVersion"
        dirty={
          values.currentlySelectedStack !== initialValues.currentlySelectedStack ||
          values.config.properties.pythonVersion !== initialValues.config.properties.pythonVersion
        }
        component={Dropdown}
        infoBubbleMessage={t('pythonInfoTextNoClick')}
        learnMoreLink={Links.pythonStackInfo}
        disabled={disableAllControls}
        label={t('pythonVersion')}
        id="pythonVersion"
        options={pythonVersions}
        {...getEarlyStackMessageParameters(earlyAccessInfoVisible, t)}
      />
      {checkAndGetStackEOLOrDeprecatedBanner(t, values.config.properties.netFrameworkVersion, eolStackDate)}
    </>
  );
};

export default PythonStack;
