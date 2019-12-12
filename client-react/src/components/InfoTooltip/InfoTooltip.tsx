import React, { useContext } from 'react';
import { TooltipHost } from 'office-ui-fabric-react';
import { style } from 'typestyle';
import { ReactComponent as InfoSvg } from '../../images/Common/info.svg';
import { ThemeContext } from '../../ThemeContext';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';

export interface InfoTooltipProps {
  content: string;
  className?: string;
}

export const defaultTooltipClass = style({
  display: 'inline-block',
});

const svgStyle = (theme: ThemeExtended) =>
  style({
    stroke: theme.semanticColors.cardBorderColor,
    fill: theme.semanticColors.cardBorderColor,
  });

export const InfoTooltip = (props: InfoTooltipProps) => {
  const theme = useContext(ThemeContext);
  const className = props.className ? props.className : defaultTooltipClass;
  return (
    <>
      <TooltipHost content={props.content} calloutProps={{ gapSpace: 0 }}>
        <span className={className}>
          <InfoSvg className={svgStyle(theme)} />
        </span>
      </TooltipHost>
    </>
  );
};
