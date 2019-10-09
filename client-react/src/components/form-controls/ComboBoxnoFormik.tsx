import React, { useContext } from 'react';
import { ComboBox, IComboBoxProps, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';

import { ThemeContext } from '../../ThemeContext';
import { comboboxStyleOverrides } from './formControl.override.styles';
import { useWindowSize } from 'react-use';
import ReactiveFormControl from './ReactiveFormControl';

interface CustomComboboxProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label: string;
  errorMessage?: string;
  dirty?: boolean;
  value: string;
  onChange: (e: unknown, option: IComboBoxOption) => void;
  learnMoreLink?: string;
}

const ComboBoxNoFormik = (props: IComboBoxProps & CustomComboboxProps) => {
  const { value, onChange, errorMessage, options, label, ...rest } = props;
  const theme = useContext(ThemeContext);
  const { width } = useWindowSize();

  const fullpage = width > 1000;
  return (
    <ReactiveFormControl {...props}>
      <ComboBox
        selectedKey={value}
        aria-labelledby={`${props.id}-label`}
        ariaLabel={props.label}
        options={options}
        onChange={onChange}
        errorMessage={errorMessage}
        useComboBoxAsMenuWidth={true}
        {...rest}
        styles={comboboxStyleOverrides(theme, fullpage)}
      />
    </ReactiveFormControl>
  );
};

export default ComboBoxNoFormik;
