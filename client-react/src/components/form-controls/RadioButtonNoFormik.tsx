import React from 'react';
import { ChoiceGroup, IChoiceGroupProps, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { style } from 'typestyle';
import { ChoiceGroupStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ChoiceGroup.styles';
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
}

const fieldStyle = style({
  marginRight: '10px',
});
const RadioButtonNoFormik: React.SFC<IChoiceGroupProps & RadioButtonProps> = props => {
  const { options, learnMore, label, subLabel, upsellMessage, theme, onChange, ...rest } = props;
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
        id={props.id}
        options={optionsWithMargin}
        onChange={onChange}
        styles={ChoiceGroupStyles}
        {...rest}
      />
    </ReactiveFormControl>
  );
};

export default RadioButtonNoFormik;
