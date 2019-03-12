import React, { FC } from 'react';
import { Stack, Link } from 'office-ui-fabric-react';
import { ReactComponent as UpsellIconSvg } from '../../upsell.svg';
import { BannerStyle, IconStyle, LinkStyle } from './UpsellBanner.styles';
import { Trans } from 'react-i18next';

interface Props {
  onClick: () => void;
}
const UpsellBanner: FC<Props> = props => {
  return (
    <Stack verticalAlign={'center'} gap={20} className={BannerStyle}>
      <Stack horizontal verticalAlign="center">
        <UpsellIconSvg className={IconStyle} />
        <Link onClick={props.onClick} className={LinkStyle}>
          <Trans>appSettingsUpsellBannerMessage</Trans>
        </Link>
      </Stack>
    </Stack>
  );
};
export default UpsellBanner;
