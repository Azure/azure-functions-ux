import { Field, FormikProps } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown from '../../../../../components/form-controls/DropDown';
import { AvailableStack } from '../../../../../models/available-stacks';
import { ArmObj } from '../../../../../models/WebAppModels';
import { AppSettingsFormValues, FormApi, FormState } from '../../AppSettings.types';
import { PermissionsContext } from '../../Contexts';

export interface StateProps {
  stacks: ArmObj<AvailableStack>[];
}

export interface OwnProps {
  formState: FormState;
  formApi: FormApi;
}

type Props = StateProps & FormikProps<AppSettingsFormValues>;

const PythonStack: React.StatelessComponent<Props> = props => {
  const { stacks } = props;
  const { app_write, editable } = useContext(PermissionsContext);
  const { t } = useTranslation();
  const pythonStack = stacks.find(x => x.name === 'python');
  if (!pythonStack) {
    return null;
  }
  const pythonVersions: {
    key: string;
    text: string;
  }[] = pythonStack!.properties.majorVersions.map(x => ({
    key: x.runtimeVersion,
    text: x.displayVersion,
  }));
  pythonVersions.push({ key: '', text: t('off') });
  return (
    <Field
      name="config.properties.pythonVersion"
      component={Dropdown}
      disabled={!app_write || !editable}
      label={t('pythonVersion')}
      id="pythonVersion"
      options={pythonVersions}
    />
  );
};

export default PythonStack;
