import { useMemo } from 'react';
import { style } from 'typestyle';

import {
  ChoiceGroup,
  IChoiceGroupOption,
  IChoiceGroupOptionStyleProps,
  IChoiceGroupOptionStyles,
  IChoiceGroupProps,
  IStyleFunctionOrObject,
} from '@fluentui/react';

import { ChoiceGroupStyles, ChoiceGroupVerticalStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ChoiceGroup.styles';

import ReactiveFormControl from './ReactiveFormControl';

interface RadioButtonProps {
  id: string;
  dirty?: boolean;
  displayInVerticalLayout?: boolean;
  infoBubbleMessage?: string;
  learnMore?: {
    learnMoreLink: string;
    learnMoreText: string;
  };
  label?: string;
  optionStyles?: IStyleFunctionOrObject<IChoiceGroupOptionStyleProps, IChoiceGroupOptionStyles>;
  subLabel?: string;
  upsellMessage?: string;
}

const fieldStyle = style({
  marginRight: '10px',
});

const RadioButtonNoFormik: React.FC<IChoiceGroupProps & RadioButtonProps> = (props: IChoiceGroupProps & RadioButtonProps) => {
  const { options, learnMore, label, subLabel, upsellMessage, theme, onChange, displayInVerticalLayout, optionStyles, ...rest } = props;

  const optionsWithMargin = useMemo<IChoiceGroupOption[]>(
    () =>
      options?.map(option => ({
        ...option,
        styles: optionStyles,
        onRenderField: (fieldProps, defaultRenderer?: (props) => JSX.Element | null) => (
          <div className={fieldStyle}>{defaultRenderer?.(fieldProps) ?? null}</div>
        ),
      })) ?? [],
    [options, optionStyles]
  );

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
