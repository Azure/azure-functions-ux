import { Field } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { FormApi, FormState } from '../../AppSettings.types';
import { PermissionsContext, AvailableStacksContext } from '../../Contexts';
import { Links } from '../../../../../utils/FwLinks';
import { getStacksSummaryForDropdown } from '../../../../../utils/stacks-utils';
import { AppStackOs } from '../../../../../models/stacks/app-stacks';
import { StackProps } from './WindowsStacks';

export interface OwnProps {
  formState: FormState;
  formApi: FormApi;
}

const PythonStack: React.StatelessComponent<StackProps> = props => {
  const { values, initialValues } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const { t } = useTranslation();
  const stacks = useContext(AvailableStacksContext);

  const pythonStack = (stacks as any[]).find(x => x.value === 'python');
  if (!pythonStack) {
    return null;
  }
  const pythonVersions = getStacksSummaryForDropdown(pythonStack, AppStackOs.windows);
  pythonVersions.push({ key: '', text: t('off') });

  return (
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
    />
  );
};

export default PythonStack;
