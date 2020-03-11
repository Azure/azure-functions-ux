import { FieldProps } from 'formik';
import { IToggleProps } from 'office-ui-fabric-react';
import React from 'react';
import ToggleNoFormik from './ToggleNoFormik';
import get from 'lodash-es/get';

export interface CustomToggleProps {
  id: string;
  infoBubbleMessage?: string;
  label: string;
  onChange: (_e, checked: boolean) => void;
}

const Toggle = (props: FieldProps & IToggleProps & CustomToggleProps) => {
  const { field, form } = props;

  const onChange = (_e, newValue: boolean) => {
    form.setFieldValue(field.name, newValue);
  };

  const checked = field.value;
  const errorMessage = get(form.errors, field.name, '') as string;

  return <ToggleNoFormik checked={checked} onChange={onChange} onBlur={field.onBlur} errorMessage={errorMessage} {...props} />;
};

export default Toggle;
