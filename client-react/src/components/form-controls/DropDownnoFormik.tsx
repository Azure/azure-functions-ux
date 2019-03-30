import React, { useContext } from 'react';
import { Dropdown as OfficeDropdown, IDropdownProps, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

import { ThemeContext } from '../../ThemeContext';
import { dropdownStyleOverrides } from './formControl.override.styles';
import { useWindowSize } from 'react-use';
import ReactiveFormControl from './ReactiveFormControl';

interface CustomDropdownProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label: string;
  errorMessage?: string;
  dirty?: boolean;
  value: string;
  onChange: (e: unknown, option: IDropdownOption) => void;
  learnMoreLink?: string;
}

const DropdownNoFormik = (props: IDropdownProps & CustomDropdownProps) => {
  const { dirty = false, value, onChange, errorMessage, options, label, ...rest } = props;
  const theme = useContext(ThemeContext);
  const { width } = useWindowSize();

  const fullpage = width > 1000;
  return (
    <ReactiveFormControl {...props}>
      <OfficeDropdown
        selectedKey={value}
        aria-labelledby={`${props.id}-label`}
        ariaLabel={props.label}
        options={options}
        onChange={onChange}
        errorMessage={errorMessage}
        {...rest}
        styles={dropdownStyleOverrides(dirty, theme, fullpage)}
      />
    </ReactiveFormControl>
  );
};

export default DropdownNoFormik;
