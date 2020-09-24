import { Field } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { PermissionsContext, WebAppStacksContext } from '../../Contexts';
import { filterDeprecatedWebStackVersions, getStacksSummaryForDropdown } from '../../../../../utils/stacks-utils';
import { AppStackOs } from '../../../../../models/stacks/app-stacks';
import { StackProps } from './WindowsStacks';

const DotNetStack: React.SFC<StackProps> = props => {
  const { values, initialValues } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const { t } = useTranslation();
  const stacks = useContext(WebAppStacksContext);

  const aspNetStack = filterDeprecatedWebStackVersions(stacks, 'aspnet', initialValues.config.properties.netFrameworkVersion).find(
    x => x.value === 'aspnet'
  );
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
      options={getStacksSummaryForDropdown(aspNetStack, AppStackOs.windows, t)}
    />
  );
};
export default DotNetStack;
