import * as React from 'react';
import { TextField as OfficeTextField, ITextFieldProps } from 'office-ui-fabric-react/lib-commonjs/TextField';
import { FieldProps } from 'formik';

const TextField = (props: FieldProps & ITextFieldProps) => {
  const { field, form, ...rest } = props;
  const onChange = (e: any, newValue: string) => {
    form.setFieldValue(field.name, newValue);
    field.onChange(e);
  };

  return (
    <OfficeTextField
      value={field.value}
      tabIndex={0}
      onChange={onChange}
      onBlur={field.onBlur}
      errorMessage={rest.errorMessage}
      {...rest}
    />
  );
};

export default TextField;
