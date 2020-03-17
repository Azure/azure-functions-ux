import { IconButton, TooltipDelay, TooltipHost } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { style } from 'typestyle';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../ThemeContext';

export interface InfoTooltipProps {
  id: string;
  content: string;
  buttonClassName?: string;
  iconClassName?: string;
}

export const defaultTooltipClass = style({
  display: 'inline-block',
});

const defaultIconStyle = (theme: ThemeExtended) =>
  style({
    color: theme.semanticColors.infoIcon,
    width: 10,
    height: 10,
    fontSize: 10,
  });

const defaultButtonStyle = style({
  width: 10,
  height: 10,
});

export const InfoTooltip = (props: InfoTooltipProps) => {
  const { buttonClassName, iconClassName } = props;
  const theme = useContext(ThemeContext);

  const buttonStyle = buttonClassName ? buttonClassName : defaultButtonStyle;
  const iconStyle = iconClassName ? iconClassName : defaultIconStyle(theme);

  return (
    /* Delay must be set to zero so that the screen reader can pick up the text */
    <TooltipHost id={props.id} content={props.content} calloutProps={{ gapSpace: 0 }} delay={TooltipDelay.zero}>
      <IconButton iconProps={{ iconName: 'Info', className: iconStyle }} aria-describedby={props.id} className={buttonStyle} />
    </TooltipHost>
  );
};
