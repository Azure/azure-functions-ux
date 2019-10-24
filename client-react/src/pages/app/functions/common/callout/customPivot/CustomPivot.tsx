import React, { useState } from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { FieldProps, Formik, FormikProps } from 'formik';
import { DefaultButton, TextField } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';
import { BindingEditorFormValues } from '../../BindingFormBuilder';

interface CustomPivotFormValues {
  key: string | undefined;
  value: string | undefined;
}

const CustomPivot: React.SFC<NewConnectionCalloutProps & FieldProps> = props => {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<CustomPivotFormValues>({ key: undefined, value: undefined });

  return (
    <Formik
      initialValues={formValues}
      onSubmit={() => createCustomConnection(formValues, props.setNewAppSettingName, props.setIsDialogVisible, props.form, props.field)}>
      {(formProps: FormikProps<CustomPivotFormValues>) => {
        return (
          <form style={paddingSidesStyle}>
            <TextField
              label={t('eventHubPicker_appSettingName')}
              onChange={(o, e) => {
                setFormValues({ ...formValues, key: e });
              }}
            />
            <TextField
              label={t('eventHubPicker_appSettingValue')}
              onChange={(o, e) => {
                setFormValues({ ...formValues, value: e });
              }}
            />
            <footer style={paddingTopStyle}>
              <DefaultButton disabled={!formValues.key || !formValues.value} onClick={formProps.submitForm}>
                {t('ok')}
              </DefaultButton>
            </footer>
          </form>
        );
      }}
    </Formik>
  );
};

const createCustomConnection = (
  formValues: CustomPivotFormValues,
  setNewAppSettingName: (e: string) => void,
  setIsDialogVisible: (d: boolean) => void,
  formProps: FormikProps<BindingEditorFormValues>,
  field: { name: string; value: any }
) => {
  if (formValues.key && formValues.value) {
    const appSettingName = formValues.key;
    formProps.setFieldValue(field.name, appSettingName);
    setNewAppSettingName(appSettingName);
    setIsDialogVisible(false);
  }
};

export default CustomPivot;
