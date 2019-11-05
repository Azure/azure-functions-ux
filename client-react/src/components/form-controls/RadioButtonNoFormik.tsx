import React from 'react';
import { ChoiceGroup, IChoiceGroupProps, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { style } from 'typestyle';
import { getChoiceGroupStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ChoiceGroup.styles';
import ReactiveFormControl from './ReactiveFormControl';
import { MessageBarType } from 'office-ui-fabric-react';

interface RadioButtonProps {
  id: string;
  label?: string;
  subLabel?: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  infoBubblePositon?: 'above' | 'right' | 'below';
  infoBubbleType?: MessageBarType.info | MessageBarType.warning | MessageBarType.error;
  learnMore?: {
    learnMoreLink: string;
    learnMoreText: string;
  };
  dirty?: boolean;
  vertical?: boolean;
}

const fieldStyle = style({ marginRight: '10px' });

const RadioButtonNoFormik: React.SFC<IChoiceGroupProps & RadioButtonProps> = props => {
  const { options, learnMore, label, subLabel, upsellMessage, theme, onChange, vertical, ...rest } = props;

  const choiceGroupStyles = getChoiceGroupStyles(vertical);

  const optionsWithMargin: IChoiceGroupOption[] | undefined =
    options &&
    options.map(option => {
      const { onRenderField } = option;
      const newOption: IChoiceGroupOption = option;
      newOption.onRenderField = (fieldProps, defaultRenderer) => (
        <div className={fieldStyle}>{!onRenderField ? defaultRenderer!(fieldProps) : onRenderField!(fieldProps, defaultRenderer)}</div>
      );
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
