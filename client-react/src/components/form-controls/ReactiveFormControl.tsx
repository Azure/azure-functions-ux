import React, { ReactNode, useContext } from 'react';
import { Stack, Label, Link, Icon, MessageBarType } from 'office-ui-fabric-react';
import {
  controlContainerStyle,
  upsellIconStyle,
  infoMessageStyle,
  infoIconStyle,
  warningIconStyle,
  errorIconStyle,
  learnMoreLinkStyle,
  formStackStyle,
  formLabelStyle,
} from './formControl.override.styles';
import UpsellIcon from '../TooltipIcons/UpsellIcon';
import { useWindowSize } from 'react-use';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../ThemeContext';
import { dirtyElementStyle } from '../../pages/app/app-settings/AppSettings.styles';

interface ReactiveFormControlProps {
  children: ReactNode;
  id: string;
  upsellMessage?: string;
  infoBubbleMessage?: string;
  infoBubblePositon?: 'above' | 'right' | 'below';
  infoBubbleType?: MessageBarType.info | MessageBarType.warning | MessageBarType.error | undefined;
  label?: string;
  learnMoreLink?: string;
  dirty?: boolean;
}

const getIconStyle = infoBubbleType => {
  switch (infoBubbleType) {
    case MessageBarType.error:
      return errorIconStyle;
    case MessageBarType.warning:
      return warningIconStyle;
    default:
      return infoIconStyle;
  }
};

const ReactiveFormControl = (props: ReactiveFormControlProps) => {
  const { upsellMessage, label, infoBubbleMessage, infoBubblePositon, learnMoreLink, dirty, infoBubbleType } = props;
  const { width } = useWindowSize();
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const fullpage = width > 1000;
  const iconStyle = getIconStyle(infoBubbleType);

  const infoBubble = () => (
    <div className={infoMessageStyle(fullpage)}>
      <Stack horizontal verticalAlign="center">
        <Icon iconName="Info" className={iconStyle(theme)} />
        <div>
          <span id={`${props.id}-infobubble`}>{`${infoBubbleMessage} `}</span>
          {learnMoreLink && (
            <Link
              id={`${props.id}-learnmore`}
              href={learnMoreLink}
              target="_blank"
              className={learnMoreLinkStyle}
              aria-labelledby={`${props.id}-infobubble ${props.id}-learnmore`}>
              {t('learnMore')}
            </Link>
          )}
        </div>
      </Stack>
    </div>
  );

  return (
    <Stack className={controlContainerStyle(!!upsellMessage, fullpage)}>
      {infoBubbleMessage && infoBubblePositon === 'above' && infoBubble()}
      <Stack horizontal={fullpage} verticalAlign="baseline">
        {label && (
          <Stack horizontal verticalAlign="center" className={formStackStyle(!!upsellMessage, fullpage)}>
            {upsellMessage && (
              <div className={upsellIconStyle}>
                <UpsellIcon upsellMessage={upsellMessage} />
              </div>
            )}
            <Label
              className={`${formLabelStyle(!!upsellMessage, fullpage)} ${dirty ? dirtyElementStyle(theme) : ''}`}
              id={`${props.id}-label`}>
              {label}
            </Label>
          </Stack>
        )}
        {props.children}
        {infoBubbleMessage && infoBubblePositon === 'right' && infoBubble()}
      </Stack>
    </Stack>
  );
};

export default ReactiveFormControl;
