import React, { useContext } from 'react';
import { Dropdown as OfficeDropdown, IDropdownProps, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import { ThemeContext } from '../../ThemeContext';
import { Stack, Label } from 'office-ui-fabric-react';
import { dropdownStyleOverrides, controlContainerStyle, upsellIconStyle, labelStyle } from './formControl.override.styles';
import UpsellIcon from '../TooltipIcons/UpsellIcon';
interface CustomDropdownProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  fullpage: boolean;
  learnMore?: {
    learnMoreLink: string;
    learnMoreText: string;
  };
}

const Dropdown = (props: FieldProps & IDropdownProps & CustomDropdownProps) => {
  const { field, form, options, learnMore, upsellMessage, fullpage, label, ...rest } = props;
  const theme = useContext(ThemeContext);
  const dirty = get(form.initialValues, field.name, null) !== field.value;

  const onChange = (e: unknown, option: IDropdownOption) => {
    form.setFieldValue(field.name, option.key);
  };
  const errorMessage = get(form.errors, field.name, '') as string;
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
      <OfficeDropdown
        selectedKey={field.value === undefined ? 'null' : field.value}
        aria-labelledby={`${props.id}-label`}
        ariaLabel={props.label}
        options={options}
        onChange={onChange}
        onBlur={field.onBlur}
        errorMessage={errorMessage}
        {...rest}
        styles={dropdownStyleOverrides(dirty, theme, fullpage)}
      />
    </Stack>
  );
};

export default Dropdown;
