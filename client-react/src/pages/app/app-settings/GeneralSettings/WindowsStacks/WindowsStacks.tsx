import { Field, FormikProps } from 'formik';
import * as React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';

import Dropdown from '../../../../../components/form-controls/DropDown';
import { AppSettingsFormValues } from '../../AppSettings.types';
import DotNetStack from './DotNetStack';
import JavaStack from './JavaStack';
import PhpStack from './PhpStack';
import PythonStack from './PythonStack';

const WindowsStacks: React.FC<FormikProps<AppSettingsFormValues> & InjectedTranslateProps> = props => {
  const { t, values } = props;
  const readonly = !values.siteWritePermission;
  const javaSelected = values.currentlySelectedStack === 'java';
  const showNonJavaAnyway = readonly && !javaSelected;
  return (
    <>
      {!readonly && (
        <Field
          name="currentlySelectedStack"
          component={Dropdown}
          fullpage
          options={[
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

export default translate('translation')(WindowsStacks);
