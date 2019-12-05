import React, { ReactNode, useContext } from 'react';
import { Stack, Label, Link, Icon } from 'office-ui-fabric-react';
import {
  controlContainerStyle,
  upsellIconStyle,
  infoMessageStyle,
  infoIconStyle,
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
  label?: string;
  learnMoreLink?: string;
  dirty?: boolean;
}

const ReactiveFormControl = (props: ReactiveFormControlProps) => {
  const { upsellMessage, label, infoBubbleMessage, learnMoreLink, dirty } = props;
  const { width } = useWindowSize();
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const fullpage = width > 1000;
  return (
    <Stack horizontal={fullpage} verticalAlign="center" className={controlContainerStyle(!!upsellMessage, fullpage)}>
      {label && (
        <Stack horizontal verticalAlign="center" className={formStackStyle(!!upsellMessage, fullpage)}>
          {upsellMessage && (
            <div className={upsellIconStyle}>
              <UpsellIcon upsellMessage={upsellMessage} />
            </div>
          )}
          <Label
            className={`${formLabelStyle(!!upsellMessage, fullpage)} ${dirty ? dirtyElementStyle(theme, true) : ''}`}
            id={`${props.id}-label`}>
            {label}
          </Label>
        </Stack>
      )}
      {props.children}
      {infoBubbleMessage && (
        <div className={infoMessageStyle(fullpage)}>
          <Stack horizontal verticalAlign="center">
            <Icon iconName="Info" className={infoIconStyle(theme)} />
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
      )}
    </Stack>
  );
};

export default ReactiveFormControl;
