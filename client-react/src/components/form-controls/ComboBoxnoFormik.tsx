import React, { useContext } from 'react';
import { ComboBox, IComboBoxProps, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';

import { ThemeContext } from '../../ThemeContext';
import { comboboxStyleOverrides } from './formControl.override.styles';
import { useWindowSize } from 'react-use';
import ReactiveFormControl from './ReactiveFormControl';
import { MessageBarType } from 'office-ui-fabric-react';

interface CustomComboboxProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: unknown, option: IComboBoxOption) => void;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  infoBubblePositon?: 'above' | 'right' | 'below';
  infoBubbleType?: MessageBarType.info | MessageBarType.warning | MessageBarType.error;
  errorMessage?: string;
  dirty?: boolean;
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
