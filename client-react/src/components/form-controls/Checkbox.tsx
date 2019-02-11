import React from 'react';
import { Checkbox as OfficeCheckbox, ICheckboxProps } from 'office-ui-fabric-react/lib/Checkbox';
import { FieldProps } from 'formik';

const Checkbox = (props: FieldProps & ICheckboxProps) => {
  const { field, form, ...rest } = props;
  const onChange = (e: any, newValue: boolean) => {
    form.setFieldValue(field.name, newValue);
    field.onChange(e);
  };

  return <OfficeCheckbox checked={field.value} onChange={onChange} onBlur={field.onBlur} ariaLabel={rest.label} {...rest} />;
};

export default Checkbox;
