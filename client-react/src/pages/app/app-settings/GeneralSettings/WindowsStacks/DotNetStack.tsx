import { Field, FormikProps } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { AppSettingsFormValues } from '../../AppSettings.types';
import { PermissionsContext } from '../../Contexts';
import { WebAppStack } from '../../../../../models/stacks/web-app-stacks';
import { getStacksSummaryForDropdown } from '../../../../../utils/stacks-utils';
import { AppStackOs } from '../../../../../models/stacks/app-stacks';

export interface StateProps {
  stacks: WebAppStack[];
}

type Props = StateProps & FormikProps<AppSettingsFormValues>;

const DotNetStack: React.SFC<Props> = props => {
  const { stacks, values, initialValues } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const { t } = useTranslation();
  const aspNetStack = stacks.find(x => x.value === 'aspnet');
  if (!aspNetStack) {
    return null;
  }

  return (
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
      options={getStacksSummaryForDropdown(aspNetStack, AppStackOs.windows)}
    />
  );
};
export default DotNetStack;
