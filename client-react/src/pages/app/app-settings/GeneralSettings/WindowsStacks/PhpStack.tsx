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

const PhpStack: React.SFC<Props> = props => {
  const { stacks, values, initialValues } = props;
  const { t } = useTranslation();
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !app_write || !editable || saving;
  const phpStack = stacks.find(x => x.value === 'php');
  if (!phpStack) {
    return null;
  }
  const phpVersions = getStacksSummaryForDropdown(phpStack, AppStackOs.windows);
  phpVersions.push({ key: '', text: t('off') });

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
      options={phpVersions}
    />
  );
};

export default PhpStack;
