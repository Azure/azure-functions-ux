import { Field, FormikProps } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown from '../../../../../components/form-controls/DropDown';
import { AvailableStack } from '../../../../../models/available-stacks';
import { ArmObj } from '../../../../../models/WebAppModels';
import { AppSettingsFormValues } from '../../AppSettings.types';
import { PermissionsContext } from '../../Contexts';

export interface StateProps {
  stacks: ArmObj<AvailableStack>[];
}

type Props = StateProps & FormikProps<AppSettingsFormValues>;

const DotNetStack: React.SFC<Props> = props => {
  const { stacks } = props;
  const { app_write, editable } = useContext(PermissionsContext);
  const { t } = useTranslation();
  const aspNetStack = stacks.find(x => x.name === 'aspnet');
  if (!aspNetStack) {
    return null;
  }
  return (
    <Field
      name="config.properties.netFrameworkVersion"
      component={Dropdown}
      label={t('netFrameWorkVersionLabel')}
      id="netValidationVersion"
      disabled={!app_write || !editable}
      options={aspNetStack!.properties.majorVersions.map(x => ({
        key: x.runtimeVersion,
        text: x.displayVersion,
      }))}
    />
  );
};
export default DotNetStack;
