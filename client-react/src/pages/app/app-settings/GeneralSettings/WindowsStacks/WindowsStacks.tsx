import { Field, FormikProps } from 'formik';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { AppSettingsFormValues } from '../../AppSettings.types';
import DotNetStack from './DotNetStack';
import JavaStack from './JavaStack';
import PhpStack from './PhpStack';
import PythonStack from './PythonStack';
import { PermissionsContext } from '../../Contexts';

export type StackProps = FormikProps<AppSettingsFormValues>;

const WindowsStacks: React.FC<StackProps> = props => {
  const { values, initialValues } = props;
  const { t } = useTranslation();
  const { app_write, editable, saving } = useContext(PermissionsContext);
  const disableAllControls = !editable || saving;
  const readonly = !app_write;
  const javaSelected = values.currentlySelectedStack === 'java';
  const showNonJavaAnyway = readonly && !javaSelected;
  return (
    <>
      {!readonly && (
        <Field
          name="currentlySelectedStack"
          dirty={values.currentlySelectedStack !== initialValues.currentlySelectedStack}
          component={Dropdown}
          fullpage
          disabled={disableAllControls}
          options={[
            {
              key: 'dotnetcore',
              text: '.NET Core',
            },
            {
              key: 'dotnet',
              text: '.NET',
            },
            {
              key: 'php',
              text: 'PHP',
            },
            {
              key: 'python',
              text: 'Python',
            },
            {
              key: 'java',
              text: 'Java',
            },
          ]}
          label={t('stack')}
          id="app-settings-stack-dropdown"
        />
      )}
      {values.currentlySelectedStack === 'dotnet' || showNonJavaAnyway ? <DotNetStack {...props} /> : null}
      {values.currentlySelectedStack === 'php' || showNonJavaAnyway ? <PhpStack {...props} /> : null}
      {values.currentlySelectedStack === 'python' || showNonJavaAnyway ? <PythonStack {...props} /> : null}
      {javaSelected ? <JavaStack {...props} /> : null}
    </>
  );
};

export default WindowsStacks;
