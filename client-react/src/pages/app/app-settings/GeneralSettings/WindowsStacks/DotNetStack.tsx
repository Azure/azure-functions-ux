import { Field } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { PermissionsContext, WebAppStacksContext } from '../../Contexts';
import { filterDeprecatedWebAppStack, getStacksSummaryForDropdown } from '../../../../../utils/stacks-utils';
import { AppStackOs } from '../../../../../models/stacks/app-stacks';
import { StackProps } from './WindowsStacks';

export interface DotNetStackProps {
  selectedStackKey: string;
}

const DotNetStack: React.SFC<StackProps & DotNetStackProps> = props => {
  const { values, initialValues, selectedStackKey } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const { t } = useTranslation();
  const supportedStacks = filterDeprecatedWebAppStack(
    useContext(WebAppStacksContext),
    selectedStackKey,
    initialValues.config.properties.netFrameworkVersion
  );

  const aspNetStack = supportedStacks.find(x => x.value === selectedStackKey);
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
