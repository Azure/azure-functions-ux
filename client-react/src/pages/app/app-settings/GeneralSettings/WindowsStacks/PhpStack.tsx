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

const PhpStack: React.SFC<Props> = props => {
  const { stacks } = props;
  const { t } = useTranslation();
  const { app_write, editable } = useContext(PermissionsContext);
  const phpStack = stacks.find(x => x.name === 'php');
  if (!phpStack) {
    return null;
  }
  return (
    <Field
      name="config.properties.phpVersion"
      component={Dropdown}
      fullpage
      label={t('phpVersion')}
      id="phpVersion"
      disabled={!app_write || !editable}
      options={phpStack!.properties.majorVersions.map(x => ({
        key: x.runtimeVersion,
        text: x.displayVersion,
      }))}
    />
  );
};

export default PhpStack;
