import { Field, FormikProps } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { AppSettingsFormValues, FormApi, FormState } from '../../AppSettings.types';
import { PermissionsContext } from '../../Contexts';
import { Links } from '../../../../../utils/FwLinks';
import { WebAppStack, WebAppStackOs } from '../../../../../models/stacks/web-app-stacks';
import { getStacksSummaryForDropdown } from '../../../../../utils/stacks-utils';

export interface StateProps {
  stacks: WebAppStack[];
}

export interface OwnProps {
  formState: FormState;
  formApi: FormApi;
}

type Props = StateProps & FormikProps<AppSettingsFormValues>;

const PythonStack: React.StatelessComponent<Props> = props => {
  const { stacks, values, initialValues } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const { t } = useTranslation();
  const pythonStack = stacks.find(x => x.value === 'python');
  if (!pythonStack) {
    return null;
  }
  const pythonVersions = getStacksSummaryForDropdown(pythonStack, WebAppStackOs.windows);
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
