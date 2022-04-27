import { Label, Stack } from '@fluentui/react';
import { useContext } from 'react';
import { style } from 'typestyle';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../ThemeContext';
import { InfoTooltip } from '../InfoTooltip/InfoTooltip';

interface InputLabelProps {
  labelText: string;
  htmlFor?: string;
  required?: boolean;
  tooltipContent?: string;
  tooltipId?: string;
}

const labelStyle = style({
  fontSize: '13px',
  fontWeight: 400,
  lineHeight: '18px',
});

const requiredIconStyle = (theme: ThemeExtended): string =>
  style({
    color: theme.semanticColors.errorText,
    fontWeight: 'bold',
    padding: '0 4px',
  });

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
