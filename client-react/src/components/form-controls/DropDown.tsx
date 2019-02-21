import React, { useContext } from 'react';
import { Dropdown as OfficeDropdown, IDropdownProps, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import { ThemeContext } from '../../ThemeContext';
import { Stack, Label } from 'office-ui-fabric-react';
import { styleOverride, dropdownContainerStyle, upsellIconStyle } from './DropDown.override.styles';
import UpsellIcon from '../TooltipIcons/UpsellIcon';
interface CustomDropdownProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  learnMore?: {
    learnMoreLink: string;
    learnMoreText: string;
  };
}

const Dropdown = (props: FieldProps & IDropdownProps & CustomDropdownProps) => {
  const { field, form, options, learnMore, upsellMessage, label, ...rest } = props;
  const theme = useContext(ThemeContext);
  const dirty = get(form.initialValues, field.name, null) !== field.value;

  const onChange = (e: unknown, option: IDropdownOption) => {
    form.setFieldValue(field.name, option.key);
  };
  const errorMessage = get(form.errors, field.name, '') as string;
  return (
    <Stack horizontal verticalAlign="center" className={dropdownContainerStyle(!!upsellMessage)}>
      <Stack horizontal verticalAlign="center" style={{ width: '220px' }}>
        {upsellMessage && (
          <div className={upsellIconStyle}>
            <UpsellIcon upsellMessage={upsellMessage} />
          </div>
        )}
        <Label>{label}</Label>
      </Stack>
      <OfficeDropdown
        selectedKey={field.value === undefined ? 'null' : field.value}
        ariaLabel={props.label}
        options={options}
        onChange={onChange}
        onBlur={field.onBlur}
        errorMessage={errorMessage}
        {...rest}
        styles={styleOverride(dirty, theme)}
      />
    </Stack>
  );
};

export default Dropdown;
