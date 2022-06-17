import {
  IStyleFunctionOrObject,
  IToggleProps,
  IToggleStyleProps,
  IToggleStyles,
  mergeStyleSets,
  Toggle as OfficeToggle,
} from '@fluentui/react';
import { useContext, useMemo } from 'react';
import { ThemeContext } from '../../ThemeContext';
import ReactiveFormControl from './ReactiveFormControl';

interface CustomToggleProps {
  id: string;
  checked?: boolean;
  errorMessage?: string; // Currently unsupported by office framework for toggle
  infoBubbleMessage?: string;
  label?: string;
  onChange?: (_: React.FormEvent<HTMLElement>, checked: boolean) => void;
  styles?: IStyleFunctionOrObject<IToggleStyleProps, IToggleStyles>;
}

const ToggleNoFormik: React.FC<IToggleProps & CustomToggleProps> = (props: IToggleProps & CustomToggleProps) => {
  const { checked, errorMessage, id, label, onChange, styles } = props;

  const theme = useContext(ThemeContext);

  const mergedStyleSets = useMemo(
    () =>
      mergeStyleSets(
        {
          thumb: {
            backgroundColor: checked ? theme.semanticColors.buttonBackground : theme.semanticColors.primaryButtonBackground,
          },
        },
        styles
      ),
    [checked, styles, theme]
  );

  return (
    <ReactiveFormControl {...props}>
      <OfficeToggle
        aria-labelledby={`${id}-label`}
        ariaLabel={label}
        onChange={onChange}
        errorMessage={errorMessage}
        styles={mergedStyleSets}
        {...props}
        label="" // ReactiveFormControl will handle the label
      />
    </ReactiveFormControl>
  );
};

export default ToggleNoFormik;
