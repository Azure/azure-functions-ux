import * as React from 'react';
import { Toggle as OfficeToggle, IToggleProps } from 'office-ui-fabric-react/lib/Toggle';
import { FieldProps } from 'formik';

const Toggle = (props: FieldProps & IToggleProps) => {
  const { field, form, ...rest } = props;
  const onChange = (e: any, newValue: boolean) => {
    form.setFieldValue(field.name, newValue);
    field.onChange(e);
  };

  return <OfficeToggle checked={field.value} tabIndex={0} onChange={onChange} onBlur={field.onBlur} ariaLabel={rest.label} {...rest} />;
};

export default Toggle;
