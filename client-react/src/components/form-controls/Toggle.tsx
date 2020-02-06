import React, { useContext } from 'react';
import { Toggle as OfficeToggle, IToggleProps } from 'office-ui-fabric-react/lib/Toggle';
import { FieldProps } from 'formik';
import { ThemeContext } from '../../ThemeContext';

const Toggle = (props: FieldProps & IToggleProps) => {
  const { field, form, ...rest } = props;
  const theme = useContext(ThemeContext);
  const onChange = (e: any, newValue: boolean) => {
    form.setFieldValue(field.name, newValue);
    field.onChange(e);
  };

  const checked = field.value;

  return (
    <OfficeToggle
      styles={{
        thumb: {
          backgroundColor: checked ? theme.semanticColors.buttonBackground : theme.semanticColors.primaryButtonBackground,
        },
      }}
      checked={checked}
      tabIndex={0}
      onChange={onChange}
      onBlur={field.onBlur}
      ariaLabel={rest.ariaLabel}
      {...rest}
    />
  );
};

export default Toggle;
