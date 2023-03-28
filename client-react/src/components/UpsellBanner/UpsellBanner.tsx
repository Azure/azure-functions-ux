import { FC } from 'react';
import { Stack, Link } from '@fluentui/react';
import { ReactComponent as UpsellIconSvg } from '../../upsell.svg';
import { BannerStyle, IconStyle, LinkStyle } from './UpsellBanner.styles';
import { Trans } from 'react-i18next';

interface Props {
  appSettingUpsell: boolean;
  onClick: () => void;
}
const UpsellBanner: FC<Props> = props => {
  return (
    <Stack verticalAlign={'center'} gap={20} className={BannerStyle}>
      <Stack horizontal verticalAlign="center">
        <UpsellIconSvg className={IconStyle} />
        <Link onClick={props.onClick} className={LinkStyle}>
          {props.appSettingUpsell ? <Trans>appSettingsUpsellBannerMessage</Trans> : <Trans>customErrorPageUpsellBannerMessage</Trans>}
        </Link>
      </Stack>
    </Stack>
  );
};
export default UpsellBanner;
