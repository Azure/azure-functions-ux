import React from 'react';
import { BindingSetting } from '../../../../models/functions/binding';
import { FieldProps, FormikProps } from 'formik';
import Dropdown, { CustomDropdownProps } from '../../../../components/form-controls/DropDown';
import { IDropdownOption, IDropdownProps } from 'office-ui-fabric-react';
import { BindingEditorFormValues } from './BindingFormBuilder';

export interface HttpMethodMultiDropdownProps {
  setting: BindingSetting;
}

const HttpMethodMultiDropdown: React.SFC<HttpMethodMultiDropdownProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const { setting, form: formProps, field } = props;

  let options: IDropdownOption[] = [];
  if (setting.enum) {
    options = setting.enum.map(e => ({ text: e.display, key: e.value }));

    // The runtime treats an undefined array as all selected
    if (!formProps.values.methods) {
      options.forEach(o => (o.selected = true));
    } else {
      for (const option of options) {
        for (const method of formProps.values.methods) {
          if (option.key === method) {
            option.selected = true;
          }
        }
      }
    }
  }

  return <Dropdown options={options} multiSelect onChange={(e, o) => onChange(o as IDropdownOption, formProps, field)} {...props} />;
};

const onChange = (option: IDropdownOption, formProps: FormikProps<BindingEditorFormValues>, field: { name: string; value: any }) => {
  const existingValueIndex: number = field.value.findIndex(v => {
    return v === option.key;
  });

  let values: string[] = field.value;
  if (existingValueIndex > -1 && !option.selected) {
    values = values.splice(existingValueIndex, 1);
  } else if (existingValueIndex === -1 && option.selected) {
    values = [...values, option.key as string];
  }

  formProps.setFieldValue(field.name, values);
};

export default HttpMethodMultiDropdown;
