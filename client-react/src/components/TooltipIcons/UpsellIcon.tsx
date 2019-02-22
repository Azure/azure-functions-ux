import React, { FC } from 'react';
import { TooltipHost, Icon, registerIcons } from 'office-ui-fabric-react';
import { ReactComponent as UpsellIconSvg } from '../../upsell.svg';
import { upsellIconStyle } from './Icon.styles';
registerIcons({
  icons: {
    'upsell-svg': <UpsellIconSvg className={upsellIconStyle} />,
  },
});

interface UpsellIconProps {
  upsellMessage: string;
}
const UpsellIcon: FC<UpsellIconProps> = props => {
  const { upsellMessage } = props;
  return (
    <TooltipHost content={upsellMessage} calloutProps={{ gapSpace: 0 }}>
      <Icon iconName="upsell-svg" />
    </TooltipHost>
  );
};

export default UpsellIcon;
