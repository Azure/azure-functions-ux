import { Label, Stack } from '@fluentui/react';
import { useContext } from 'react';
import { ThemeContext } from '../../ThemeContext';
import { InfoTooltip } from '../InfoTooltip/InfoTooltip';
import { labelStyle, requiredIconStyle } from './InputLabel.styles';

interface InputLabelProps {
  labelText: string;
  htmlFor?: string;
  required?: boolean;
  tooltipContent?: string;
  tooltipId?: string;
}

const InputLabel: React.FC<InputLabelProps> = ({ htmlFor, labelText, required, tooltipContent, tooltipId }: InputLabelProps) => {
  const theme = useContext(ThemeContext);

  return (
    <Stack horizontal verticalAlign="center">
      <Label htmlFor={htmlFor} className={labelStyle}>
        {labelText}
      </Label>
      {required && <span className={requiredIconStyle(theme)}>*</span>}
      {tooltipId && tooltipContent && <InfoTooltip id={tooltipId} content={tooltipContent} />}
    </Stack>
  );
};

export default InputLabel;
