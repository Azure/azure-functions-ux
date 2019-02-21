import React from 'react';
import { ChoiceGroup, IChoiceGroupProps, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { FieldProps } from 'formik';
import { Label, Stack } from 'office-ui-fabric-react';
import { style } from 'typestyle';
import { ChoiceGroupStyles } from '../../theme/CustomOfficeFabric/AzurePortal/ChoiceGroup.styles';
import { labelStyle, upsellIconStyle, controlContainerStyle } from './formControl.override.styles';
import UpsellIcon from '../TooltipIcons/UpsellIcon';

interface RadioButtonProps {
  fullpage: boolean;
  subLabel?: string;
  upsellMessage?: string;
  learnMore?: {
    learnMoreLink: string;
    learnMoreText: string;
  };
}

const fieldStyle = style({
  marginRight: '10px',
});
const RadioButton: React.SFC<IChoiceGroupProps & FieldProps & RadioButtonProps> = props => {
  const { field, form, options, learnMore, label, subLabel, upsellMessage, fullpage, theme, ...rest } = props;
  const onChange = (e: unknown, option: IChoiceGroupOption) => {
    form.setFieldValue(field.name, option.key);
  };
  const optionsWithMargin: IChoiceGroupOption[] | undefined =
    options &&
    options.map(option => {
      const newOption: IChoiceGroupOption = option;
      newOption.onRenderField = (fieldProps, defaultRenderer) => <div className={fieldStyle}>{defaultRenderer!(fieldProps)}</div>;
      return newOption;
    });
  return (
    <Stack horizontal={fullpage} verticalAlign="center" className={controlContainerStyle(!!upsellMessage, fullpage)}>
      <Stack horizontal verticalAlign="center" className={labelStyle(!!upsellMessage, fullpage)}>
        {upsellMessage && (
          <div className={upsellIconStyle}>
            <UpsellIcon upsellMessage={upsellMessage} />
          </div>
        )}
        <Label id={`${props.id}-label`}>{label}</Label>
      </Stack>
      <ChoiceGroup
        ariaLabelledBy={`${props.id}-label`}
        id={props.id}
        selectedKey={field.value}
        options={optionsWithMargin}
        onChange={onChange}
        styles={ChoiceGroupStyles}
        {...rest}
      />
    </Stack>
  );
};

export default RadioButton;
