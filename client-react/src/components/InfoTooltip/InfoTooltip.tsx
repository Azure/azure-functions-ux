import { TooltipDelay, TooltipHost } from '@fluentui/react';
import { useContext } from 'react';
import { style } from 'typestyle';
import { ReactComponent as InfoTooltipSvg } from '../../images/Common/InfoTooltip.svg';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../ThemeContext';

export interface InfoTooltipProps {
  id: string;
  content: string | JSX.Element | JSX.Element[];
  iconClassName?: string;
}

const defaultIconStyle = (theme: ThemeExtended) =>
  style({
    fill: theme.semanticColors.infoIcon,
    marginLeft: '2px',
  });

export const InfoTooltip = (props: InfoTooltipProps) => {
  const { iconClassName, id, content } = props;
  const theme = useContext(ThemeContext);

  const iconStyle = iconClassName ? iconClassName : defaultIconStyle(theme);

  return (
    /* Delay must be set to zero so that the screen reader can pick up the text */
    <TooltipHost id={id} content={content} calloutProps={{ gapSpace: 0 }} delay={TooltipDelay.zero}>
      <InfoTooltipSvg aria-label={typeof content == 'string' ? content : ''} focusable="true" tabIndex={0} className={iconStyle} />
    </TooltipHost>
  );
};
