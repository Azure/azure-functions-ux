import { Icon, Label, Link, Stack, TooltipHost, TooltipOverflowMode } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from 'react-use';
import { style } from 'typestyle';
import { dirtyElementStyle } from '../../pages/app/app-settings/AppSettings.styles';
import { ThemeExtended } from '../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../ThemeContext';
import { InfoTooltip } from '../InfoTooltip/InfoTooltip';
import UpsellIcon from '../TooltipIcons/UpsellIcon';
import {
  controlContainerStyle,
  formLabelStyle,
  formStackStyle,
  hostStyle,
  infoIconStyle,
  infoMessageStyle,
  learnMoreLinkStyle,
  tooltipStyle,
  upsellIconStyle,
} from './formControl.override.styles';

interface ReactiveFormControlProps {
  children: JSX.Element;
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  label?: string;
  learnMoreLink?: string;
  dirty?: boolean;
  formControlClassName?: string;
  horizontal?: boolean;
  mouseOverToolTip?: string;
  required?: boolean;
  multiline?: boolean;
}

const ReactiveFormControl = (props: ReactiveFormControlProps) => {
  const {
    upsellMessage,
    label,
    infoBubbleMessage,
    learnMoreLink,
    dirty,
    formControlClassName,
    horizontal,
    children,
    id,
    mouseOverToolTip,
    required,
    multiline,
  } = props;
  const { width } = useWindowSize();
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const fullPage = width > 1000;
  return (
    <Stack
      horizontal={horizontal !== undefined ? horizontal : fullPage}
      verticalAlign="center"
      className={`${!!formControlClassName ? formControlClassName : ''} ${controlContainerStyle(!!upsellMessage, fullPage)}`}>
      {label && (
        <Stack horizontal verticalAlign="center" className={formStackStyle(!!upsellMessage, fullPage)}>
          {upsellMessage && (
            <div className={upsellIconStyle}>
              <UpsellIcon upsellMessage={upsellMessage} />
            </div>
          )}
          <Label
            className={`${formLabelStyle(!!upsellMessage, fullPage)} ${dirty ? dirtyElementStyle(theme, true) : ''}`}
            id={`${id}-label`}>
            <TooltipHost overflowMode={TooltipOverflowMode.Self} content={label} hostClassName={hostStyle(multiline)} styles={tooltipStyle}>
              {label}
            </TooltipHost>
            {getRequiredIcon(theme, required)} {getMouseOverToolTip(`${children.props.id}-tooltip`, mouseOverToolTip)}
          </Label>
        </Stack>
      )}
      {children}
      {infoBubbleMessage && (
        <div className={infoMessageStyle(fullPage)}>
          <Stack horizontal verticalAlign="center">
            <Icon iconName="Info" className={infoIconStyle(theme)} />
            <div>
              <span id={`${id}-infobubble`}>{`${infoBubbleMessage} `}</span>
              {learnMoreLink && (
                <Link
                  id={`${id}-learnmore`}
                  href={learnMoreLink}
                  target="_blank"
                  className={learnMoreLinkStyle}
                  aria-labelledby={`${id}-infobubble ${id}-learnmore`}>
                  {t('learnMore')}
                </Link>
              )}
            </div>
          </Stack>
        </div>
      )}
    </Stack>
  );
};

const getRequiredIcon = (theme: ThemeExtended, required?: boolean) => {
  if (required) {
    return (
      <span
        className={style({
          fontWeight: 'bold',
          color: theme.palette.red,
        })}>
        *
      </span>
    );
  }
};

const getMouseOverToolTip = (id: string, content?: string) => {
  if (content) {
    return <InfoTooltip id={id} content={content} />;
  }
};

export default ReactiveFormControl;
