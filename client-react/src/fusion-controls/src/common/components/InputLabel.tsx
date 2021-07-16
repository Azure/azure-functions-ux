import React, { useContext } from 'react';
import { Stack, Label } from 'office-ui-fabric-react';
import { InfoTooltip } from './InfoTooltip';
import { style } from 'typestyle';
import { ThemeContext } from '../ThemeContext';
import { ThemeExtended } from '../theme/SemanticColorsExtended';

interface InputLabelProps {
  labelText: string;
  htmlFor?: string;
  required?: boolean;
  tooltipId?: string;
  tooltipContent?: string;
}

const labelStyle = style({
  fontSize: '13px',
  lineHeight: '18px',
  fontWeight: 400,
});

const requiredIconStyle = (theme: ThemeExtended) =>
  style({
    fontWeight: 'bold',
    color: theme.semanticColors.errorText,
    padding: '0 4px',
  });

const getRequiredIcon = (theme: ThemeExtended, required?: boolean) => {
  if (required) {
    return <span className={requiredIconStyle(theme)}>*</span>;
  }
};

const InputLabel = (props: InputLabelProps): JSX.Element => {
  const theme = useContext(ThemeContext);
  const { htmlFor, labelText, required, tooltipId, tooltipContent } = props;

  return (
    <Stack horizontal verticalAlign="center">
      <Label htmlFor={htmlFor} className={labelStyle}>
        {labelText}
      </Label>
      {getRequiredIcon(theme, required)}
      {tooltipId && tooltipContent && <InfoTooltip id={tooltipId} content={tooltipContent} />}
    </Stack>
  );
};

export default InputLabel;
