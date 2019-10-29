import React, { useState } from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { FieldProps, Formik, FormikProps } from 'formik';
import { DefaultButton, TextField } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import { BindingEditorFormValues } from '../../BindingFormBuilder';

interface CustomPivotFormValues {
  name: string | undefined;
}

const NewPivot: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<CustomPivotFormValues>({ name: undefined });

  return (
    <Formik
      initialValues={formValues}
      onSubmit={() => setNewConnection(formValues, props.setNewAppSettingName, props.setIsDialogVisible, props.form, props.field)}>
      {(formProps: FormikProps<CustomPivotFormValues>) => {
        return (
          <form style={paddingSidesStyle}>
            <TextField
              label={t('_name')}
              onChange={(o, e) => {
                setFormValues({ ...formValues, name: e });
              }}
            />
            <footer style={paddingTopStyle}>
              <DefaultButton disabled={!formValues.name} onClick={formProps.submitForm}>
                {t('ok')}
              </DefaultButton>
            </footer>
          </form>
        );
      }}
    </Formik>
  );
};

const setNewConnection = (
  formValues: CustomPivotFormValues,
  setNewAppSettingName: (e: string) => void,
  setIsDialogVisible: (d: boolean) => void,
  formProps: FormikProps<BindingEditorFormValues>,
  field: { name: string; value: any }
) => {
  if (formValues.name) {
    const appSettingName = formValues.name;
    formProps.setFieldValue(field.name, appSettingName);
    setNewAppSettingName(appSettingName);
    setIsDialogVisible(false);
  }
};

export default NewPivot;
