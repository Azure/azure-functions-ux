import { TooltipDelay, TooltipHost } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { style } from 'typestyle';
import { ReactComponent as InfoTooltipSvg } from '../../images/Common/InfoTooltip.svg';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../ThemeContext';

export interface InfoTooltipProps {
  id: string;
  content: string;
  iconClassName?: string;
}

const defaultIconStyle = (theme: ThemeExtended) =>
  style({
    fill: theme.semanticColors.infoIcon,
    marginLeft: '2px',
  });

export const InfoTooltip = (props: InfoTooltipProps) => {
  const { iconClassName } = props;
  const theme = useContext(ThemeContext);

  const iconStyle = iconClassName ? iconClassName : defaultIconStyle(theme);

  return (
    /* Delay must be set to zero so that the screen reader can pick up the text */
    <TooltipHost id={props.id} content={props.content} calloutProps={{ gapSpace: 0 }} delay={TooltipDelay.zero}>
      <InfoTooltipSvg aria-describedby={props.id} focusable="true" tabIndex={0} className={iconStyle} />
    </TooltipHost>
  );
};
