import React, { FC, useContext } from 'react';
import { Stack, Icon, Link } from 'office-ui-fabric-react';
import { bannerStyle, infoIconStyle } from './InformationBanner.styles';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../../ThemeContext';
import { learnMoreLinkStyle } from '../form-controls/formControl.override.styles';

interface Props {
  learnMoreLink?: string;
  id: string;
  infoBubbleMessage: string;
}

const InformationBanner: FC<Props> = props => {
  const { learnMoreLink, infoBubbleMessage, id } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);

  return (
    <Stack verticalAlign={'center'} gap={20} className={bannerStyle(theme)}>
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
    </Stack>
  );
};
export default InformationBanner;
