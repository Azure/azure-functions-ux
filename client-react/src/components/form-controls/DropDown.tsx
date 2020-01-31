import React from 'react';
import { IDropdownProps, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import DropdownNoFormik from './DropDownnoFormik';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';

export interface CustomDropdownProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label: string;
  learnMoreLink?: string;
  dirty?: boolean;
}

const Dropdown = (props: FieldProps & IDropdownProps & CustomDropdownProps) => {
  const { field, form } = props;

  const onChange = (e: unknown, option: IDropdownOption) => {
    form.setFieldValue(field.name, option.key);
  };
  const errorMessage = get(form.errors, field.name, '') as string;
  return (
    <DropdownNoFormik
      value={field.value === undefined ? 'null' : field.value}
      onBlur={field.onBlur}
      errorMessage={errorMessage}
      onChange={onChange}
      responsiveMode={ResponsiveMode.large}
      {...props}
    />
  );
};

export default Dropdown;
