import React, { FC } from 'react';
import { Icon } from 'office-ui-fabric-react';
import { infoIconStyle } from './Icon.styles';
import { useHover } from 'react-use';

interface InfoIconProps {
  upsellMessage: string;
}
const InfoIcon: FC<InfoIconProps> = props => {
  const icon = () => <Icon iconName="Info" className={infoIconStyle} />;
  const [hoverable, hovered] = useHover(icon);
  return (
    <>
      {hoverable}
      {hovered && <>Hello</>}
    </>
  );
};

export default InfoIcon;
