import React from 'react';
import { IChoiceGroupProps, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { FieldProps } from 'formik';
import RadioButtonNoFormik from './RadioButtonNoFormik';

interface RadioButtonProps {
  id: string;
  label: string;
  subLabel?: string;
  upsellMessage?: string;
  learnMore?: {
    learnMoreLink: string;
    learnMoreText: string;
  };
  dirty?: boolean;
  vertical?: boolean;
}

const RadioButton: React.SFC<IChoiceGroupProps & FieldProps & RadioButtonProps> = props => {
  const { field, form, options, theme, ...rest } = props;
  const onChange = (e: unknown, option: IChoiceGroupOption) => {
    form.setFieldValue(field.name, option.key);
  };
  return (
    <RadioButtonNoFormik
      ariaLabelledBy={`${props.id}-label`}
      id={props.id}
      selectedKey={field.value}
      options={options}
      onChange={onChange}
      {...rest}
    />
  );
};

export default RadioButton;
