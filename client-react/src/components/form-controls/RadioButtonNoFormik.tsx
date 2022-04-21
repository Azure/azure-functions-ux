import React from 'react';
import { ChoiceGroup, IChoiceGroupProps, IChoiceGroupOption } from '@fluentui/react';
import { style } from 'typestyle';
import { ChoiceGroupStyles, ChoiceGroupVerticalStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ChoiceGroup.styles';
import ReactiveFormControl from './ReactiveFormControl';

interface RadioButtonProps {
  id: string;
  label?: string;
  subLabel?: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  learnMore?: {
    learnMoreLink: string;
    learnMoreText: string;
  };
  dirty?: boolean;
  displayInVerticalLayout?: boolean;
}

const fieldStyle = style({
  marginRight: '10px',
});
const RadioButtonNoFormik: React.SFC<IChoiceGroupProps & RadioButtonProps> = props => {
  const { options, learnMore, label, subLabel, upsellMessage, theme, onChange, displayInVerticalLayout, ...rest } = props;
  const optionsWithMargin: IChoiceGroupOption[] | undefined =
    options &&
    options.map(option => {
      const newOption: IChoiceGroupOption = option;
      newOption.onRenderField = (fieldProps, defaultRenderer) => <div className={fieldStyle}>{defaultRenderer!(fieldProps)}</div>;
      return newOption;
    });
  return (
    <ReactiveFormControl {...props}>
      <ChoiceGroup
        ariaLabelledBy={`${props.id}-label`}
        options={optionsWithMargin}
        onChange={onChange}
        styles={displayInVerticalLayout ? ChoiceGroupVerticalStyles : ChoiceGroupStyles}
        {...rest}
      />
    </ReactiveFormControl>
  );
};

export default RadioButtonNoFormik;
