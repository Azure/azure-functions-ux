import React, { useContext } from 'react';
import { Dropdown as OfficeDropdown, IDropdownProps, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldProps } from 'formik';
import get from 'lodash-es/get';
import { ThemeContext } from '../../ThemeContext';
import { Stack, Label } from 'office-ui-fabric-react';
import { styleOverride, dropdownContainerStyle } from './DropDown.override.styles';
import UpsellIcon from '../TooltipIcons/UpsellIcon';
import InfoIcon from '../TooltipIcons/InfoIcon';
interface CustomDropdownProps {
  fullpage?: boolean;
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  learnMore?: {
    learnMoreLink: string;
    learnMoreText: string;
  };
}

const Dropdown = (props: FieldProps & IDropdownProps & CustomDropdownProps) => {
  const { field, form, options, learnMore, upsellMessage, label, fullpage, ...rest } = props;
  const theme = useContext(ThemeContext);
  const dirty = get(form.initialValues, field.name, null) !== field.value;

  const onChange = (e: unknown, option: IDropdownOption) => {
    form.setFieldValue(field.name, option.key);
  };
  const errorMessage = get(form.errors, field.name, '') as string;
  return (
    <Stack horizontal verticalAlign="center" className={dropdownContainerStyle(!upsellMessage)}>
      <Stack horizontal verticalAlign="center" style={{ width: '220px' }}>
        <div style={{ marginRight: '6px' }}>
          <UpsellIcon upsellMessage="Hello World" />
        </div>
        <Label>{label}</Label>
        <div style={{ marginLeft: '6px' }}>
          <InfoIcon upsellMessage="Hello World" />
        </div>
      </Stack>
      <OfficeDropdown
        selectedKey={field.value === undefined ? 'null' : field.value}
        ariaLabel={props.label}
        options={options}
        onChange={onChange}
        onBlur={field.onBlur}
        errorMessage={errorMessage}
        {...rest}
        styles={styleOverride(dirty, theme, fullpage)}
      />
    </Stack>
  );
};

export default Dropdown;
