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

const PhpStack: React.SFC<Props> = props => {
  const { stacks, values, initialValues } = props;
  const { t } = useTranslation();
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const phpStack = stacks.find(x => x.name === 'php');
  if (!phpStack) {
    return null;
  }
  return (
    <Field
      name="config.properties.phpVersion"
      dirty={
        values.currentlySelectedStack !== initialValues.currentlySelectedStack ||
        values.config.properties.phpVersion !== initialValues.config.properties.phpVersion
      }
      component={Dropdown}
      fullpage
      label={t('phpVersion')}
      id="phpVersion"
      disabled={disableAllControls}
      options={phpStack!.properties.majorVersions.map(x => ({
        key: x.runtimeVersion,
        text: x.isEndOfLife ? t('endOfLifeTagTemplate').format(x.displayVersion) : x.displayVersion,
      }))}
    />
  );
};

export default PhpStack;
