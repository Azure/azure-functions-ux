import { FC } from 'react';
import { Stack, Link } from '@fluentui/react';
import { ReactComponent as UpsellIconSvg } from '../../upsell.svg';
import { BannerStyle, IconStyle, LinkStyle } from './UpsellBanner.styles';
import { useTranslation } from 'react-i18next';
interface Props {
  bannerMessage: string;
  learnMoreLink?: string;
  learnMoreLinkAriaLabel?: string;
  onClick: () => void;
}

const UpsellBanner: FC<Props> = props => {
  const { t } = useTranslation();
  return (
    <Stack verticalAlign={'center'} gap={20} className={BannerStyle}>
      <Stack horizontal verticalAlign="center">
        <UpsellIconSvg className={IconStyle} />
        <Link onClick={props.onClick} className={LinkStyle}>
          {props.bannerMessage}
        </Link>
        {props.learnMoreLink ? (
          <Link
            href={props.learnMoreLink}
            target="_blank"
            aria-label={props.learnMoreLinkAriaLabel ? props.learnMoreLinkAriaLabel : t('learnMore')}>
            {t('learnMore')}
          </Link>
        ) : (
          undefined
        )}
      </Stack>
    </Stack>
  );
};
export default UpsellBanner;
