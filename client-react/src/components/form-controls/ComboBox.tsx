import React from 'react';
import { ComboBox as OfficeComboBox, IComboBoxProps, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
interface CustomComboBoxProps {
  fullpage?: boolean;
  id: string;
  subLabel?: string;
  learnMore?: {
    learnMoreLink: string;
    learnMoreText: string;
  };
}

const ComboBox = (props: FieldProps & IComboBoxProps & CustomComboBoxProps) => {
  const { field, form, options, learnMore, subLabel, fullpage, ...rest } = props;

  const onChange = (e: unknown, option: IComboBoxOption) => {
    form.setFieldValue(field.name, option.key);
  };
  const errorMessage = get(form.errors, field.name, '') as string;
  return (
    <OfficeComboBox
      selectedKey={field.value === undefined ? 'null' : field.value}
      ariaLabel={props.label}
      options={options}
      onChange={onChange}
      onBlur={field.onBlur}
      errorMessage={errorMessage}
      {...rest}
    />
  );
};

export default ComboBox;
