import React from 'react';
import { ChoiceGroup, IChoiceGroupProps, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { style } from 'typestyle';
import { ChoiceGroupStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ChoiceGroup.styles';
import ReactiveFormControl from './ReactiveFormControl';

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

const RadioButtonNoFormik: React.SFC<IChoiceGroupProps & RadioButtonProps> = props => {
  const { options, learnMore, label, subLabel, upsellMessage, theme, onChange, vertical, ...rest } = props;

  const [choiceGroupStyles, fieldStyle] = vertical ? [undefined, undefined] : [ChoiceGroupStyles, style({ marginRight: '10px' })];

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
        styles={choiceGroupStyles}
        {...rest}
      />
    </ReactiveFormControl>
  );
};

export default RadioButtonNoFormik;
