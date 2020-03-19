import { Formik, FormikProps } from 'formik';
import { IDropdownOption, PrimaryButton, TextField } from 'office-ui-fabric-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NewConnectionCalloutProps } from '../Callout.properties';
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
              <PrimaryButton disabled={!formValues.key || !formValues.value} onClick={formProps.submitForm}>
                {t('ok')}
              </PrimaryButton>
            </footer>
          </form>
        );
      }}
    </Formik>
  );
};

const setCustomConnection = (
  formValues: CustomPivotFormValues,
  setNewAppSetting: React.Dispatch<React.SetStateAction<{ key: string; value: string }>>,
  setSelectedItem: React.Dispatch<React.SetStateAction<IDropdownOption | undefined>>,
  setIsDialogVisible: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (formValues.key && formValues.value) {
    setNewAppSetting({ key: formValues.key, value: formValues.value });
    setSelectedItem({ key: formValues.key, text: formValues.key, data: formValues.value });
    setIsDialogVisible(false);
  }
};

export default CustomPivot;
