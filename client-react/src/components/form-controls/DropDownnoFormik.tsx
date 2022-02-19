import { Dropdown as OfficeDropdown, IDropdownOption, IDropdownProps } from 'office-ui-fabric-react/lib/Dropdown';
import React, { useContext } from 'react';
import { useWindowSize } from 'react-use';
import { ThemeContext } from '../../ThemeContext';
import { dropdownStyleOverrides } from './formControl.override.styles';
import ReactiveFormControl, { Layout } from './ReactiveFormControl';

interface CustomDropdownProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label?: string;
  errorMessage?: string;
  dirty?: boolean;
  onChange: (e: unknown, option: IDropdownOption) => void;
  learnMoreLink?: string;
  widthOverride?: string;
  onPanel?: boolean;
  layout?: Layout;
  mouseOverToolTip?: string;
  customLabelClassName?: string;
}

const DropdownNoFormik = (props: IDropdownProps & CustomDropdownProps) => {
  const { onChange, errorMessage, id, options, label, widthOverride, onPanel, required, ...rest } = props;
  const theme = useContext(ThemeContext);
  const { width } = useWindowSize();

  const fullpage = !onPanel && width > 1000;

  return (
    <ReactiveFormControl {...props}>
      <OfficeDropdown
        aria-labelledby={`${id}-label`}
        ariaLabel={label}
        options={options}
        onChange={onChange}
        errorMessage={errorMessage}
        {...rest}
        styles={dropdownStyleOverrides(theme, fullpage, widthOverride)}
        required={false} // ReactiveFormControl will handle displaying required
        //NOTE(michinoy): even though we are handling the required display marker at
        //the field level, for a11y we need to have the aria-required tag set.
        aria-required={!!required}
      />
    </ReactiveFormControl>
  );
};

export default DropdownNoFormik;
