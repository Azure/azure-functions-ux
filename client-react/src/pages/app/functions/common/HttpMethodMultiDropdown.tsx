import React from 'react';
import { FieldProps } from 'formik';

import { IDropdownOption, IDropdownProps } from '@fluentui/react';

import Dropdown, { CustomDropdownProps } from '../../../../components/form-controls/DropDown';
import { BindingSetting } from '../../../../models/functions/binding';

export interface HttpMethodMultiDropdownProps {
  setting: BindingSetting;
}

const HttpMethodMultiDropdown: React.SFC<HttpMethodMultiDropdownProps & CustomDropdownProps & FieldProps & IDropdownProps> = props => {
  const { setting, form: formProps } = props;

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

  return <Dropdown multiSelect {...props} options={options} />;
};

export default HttpMethodMultiDropdown;
