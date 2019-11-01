import React, { useState } from 'react';
import { NewConnectionCalloutProps } from '../Callout.properties';
import { Formik, FormikProps } from 'formik';
import { DefaultButton, TextField } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { paddingSidesStyle, paddingTopStyle } from '../Callout.styles';

interface CustomPivotFormValues {
  key: string | undefined;
  value: string | undefined;
}

const CustomPivot: React.SFC<NewConnectionCalloutProps> = props => {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<CustomPivotFormValues>({ key: undefined, value: undefined });

  return (
    <Formik
      initialValues={formValues}
      onSubmit={() => setCustomConnection(formValues, props.setNewAppSetting, props.setSelectedItem, props.setIsDialogVisible)}>
      {(formProps: FormikProps<CustomPivotFormValues>) => {
        return (
          <form style={paddingSidesStyle}>
            <TextField
              label={t('customPivot_key')}
              onChange={(o, e) => {
                setFormValues({ ...formValues, key: e });
              }}
            />
            <TextField
              label={t('customPivot_value')}
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

const setCustomConnection = (
  formValues: CustomPivotFormValues,
  setNewAppSetting: (a: { key: string; value: string }) => void,
  setSelectedItem: (u: undefined) => void,
  setIsDialogVisible: (b: boolean) => void
) => {
  if (formValues.key && formValues.value) {
    setNewAppSetting({ key: formValues.key, value: formValues.value });
    setSelectedItem(undefined);
    setIsDialogVisible(false);
  }
};

export default CustomPivot;
