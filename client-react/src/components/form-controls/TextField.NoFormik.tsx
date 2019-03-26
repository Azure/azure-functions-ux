import React, { FC, useContext } from 'react';
import { TextField as OfficeTextField, ITextFieldProps } from 'office-ui-fabric-react/lib/TextField';
import ReactiveFormControl from './ReactiveFormControl';
import { useWindowSize } from 'react-use';
import { ThemeContext } from '../../ThemeContext';
import { textFieldStyleOverrides } from './formControl.override.styles';

interface CustomTextFieldProps {
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label: string;
  learnMoreLink?: string;
  dirty?: boolean;
}
const TextFieldNoFormik: FC<ITextFieldProps & CustomTextFieldProps> = props => {
  const { value, onChange, onBlur, errorMessage, label, dirty, ...rest } = props;
  const { width } = useWindowSize();
  const theme = useContext(ThemeContext);
  const fullpage = width > 1000;
  return (
    <ReactiveFormControl {...props}>
      <OfficeTextField
        value={value}
        tabIndex={0}
        onChange={onChange}
        onBlur={onBlur}
        errorMessage={errorMessage}
        styles={textFieldStyleOverrides(dirty, theme, fullpage)}
        {...rest}
      />
    </ReactiveFormControl>
  );
};
export default TextFieldNoFormik;
