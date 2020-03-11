import React, { useContext } from 'react';
import { Toggle as OfficeToggle, IToggleProps } from 'office-ui-fabric-react/lib/Toggle';
import { ThemeContext } from '../../ThemeContext';
import ReactiveFormControl from './ReactiveFormControl';

interface CustomToggleProps {
  id: string;
  infoBubbleMessage?: string;
  label?: string;
  // Currently unsupported by office framework
  errorMessage?: string;
  checked?: boolean;
  onChange: (_e, checked: boolean) => void;
}

const ToggleNoFormik = (props: IToggleProps & CustomToggleProps) => {
  const { checked, onChange, errorMessage, label } = props;
  const theme = useContext(ThemeContext);

  return (
    <ReactiveFormControl {...props}>
      <OfficeToggle
        aria-labelledby={`${props.id}-label`}
        ariaLabel={label}
        onChange={onChange}
        errorMessage={errorMessage}
        styles={{
          thumb: {
            backgroundColor: checked ? theme.semanticColors.buttonBackground : theme.semanticColors.primaryButtonBackground,
          },
        }}
        {...props}
      />
    </ReactiveFormControl>
  );
};

export default ToggleNoFormik;
