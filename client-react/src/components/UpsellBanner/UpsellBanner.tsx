import { FC } from 'react';

import { Link, Stack } from '@fluentui/react';

import { ReactComponent as UpsellIconSvg } from '../../upsell.svg';

import { BannerStyle, IconStyle, LinkStyle } from './UpsellBanner.styles';

interface Props {
  bannerMessage: string;
  onClick: () => void;
}
const UpsellBanner: FC<Props> = props => {
  return (
    <Stack verticalAlign={'center'} gap={20} className={BannerStyle}>
      <Stack horizontal verticalAlign="center">
        <UpsellIconSvg className={IconStyle} />
        <Link onClick={props.onClick} className={LinkStyle}>
          {props.bannerMessage}
        </Link>
      </Stack>
    </Stack>
  );
};
export default UpsellBanner;
