import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';

import { Layout } from '../../../../../components/form-controls/ReactiveFormControl';
import TextField from '../../../../../components/form-controls/TextField';
import { horizontalLabelStyle } from '../../common/BindingFormBuilder.styles';

import { useFiles } from './useFiles';

interface NewFileTextFieldProps {
  id: string;
  label: string;
  required: boolean;
  resourceId: string;
  help?: string;
}

const NewFileTextField: React.FC<NewFileTextFieldProps> = ({ id, help, label, required, resourceId }: NewFileTextFieldProps) => {
  const validate = useNewFileValidator(required, resourceId);

  return (
    <Field
      id={id}
      component={TextField}
      customLabelClassName={horizontalLabelStyle}
      customLabelStackClassName={horizontalLabelStyle}
      dirty={false}
      label={label}
      layout={Layout.Horizontal}
      mouseOverToolTip={help}
      name={id}
      onPanel
      required={required}
      resourceId={resourceId}
      validate={validate}
    />
  );
};

function useNewFileValidator(required: boolean, resourceId: string) {
  const { t } = useTranslation();

  const { existsFile } = useFiles(resourceId);

  const validate = useCallback(
    async (value?: string): Promise<string | undefined> => {
      if (!value) {
        if (required) {
          return t('fieldRequired');
        }
      } else {
        if (await existsFile(value)) {
          return t('functionNew_fileExists').format(value);
        }
      }
    },
    [existsFile, required, t]
  );

  return validate;
}

export default NewFileTextField;
