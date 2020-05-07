import React from 'react';
import { IChoiceGroupProps, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { FieldProps } from 'formik';
import { ChoiceGroupStyles, ChoiceGroupVerticalStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ChoiceGroup.styles';
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
  displayInVerticalLayout?: boolean;
}

const RadioButton: React.SFC<IChoiceGroupProps & FieldProps & RadioButtonProps> = props => {
  const { field, form, options, theme, displayInVerticalLayout, ...rest } = props;
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
      styles={displayInVerticalLayout ? ChoiceGroupVerticalStyles : ChoiceGroupStyles}
      {...rest}
    />
  );
};

export default RadioButton;
