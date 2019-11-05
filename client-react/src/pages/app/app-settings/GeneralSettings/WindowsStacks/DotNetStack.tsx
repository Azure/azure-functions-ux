import { Field, FormikProps } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown from '../../../../../components/form-controls/DropDown';
import { AvailableStack } from '../../../../../models/available-stacks';
import { AppSettingsFormValues } from '../../AppSettings.types';
import { PermissionsContext } from '../../Contexts';
import { ArmObj } from '../../../../../models/arm-obj';

export interface StateProps {
  stacks: ArmObj<AvailableStack>[];
}

type Props = StateProps & FormikProps<AppSettingsFormValues>;

const DotNetStack: React.SFC<Props> = props => {
  const { stacks, values, initialValues } = props;
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const { t } = useTranslation();
  const aspNetStack = stacks.find(x => x.name === 'aspnet');
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
      options={aspNetStack!.properties.majorVersions.map(x => ({
        key: x.runtimeVersion,
        text: x.displayVersion,
      }))}
    />
  );
};
export default DotNetStack;
