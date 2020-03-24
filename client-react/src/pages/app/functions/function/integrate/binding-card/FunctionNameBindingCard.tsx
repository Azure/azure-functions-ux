import { Link } from 'office-ui-fabric-react';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as FunctionSvg } from '../../../../../../images/AppService/functions_f.svg';
import { ArmObj } from '../../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../../models/functions/function-info';
import { BroadcastMessageId, MenuId, SelectedMenuItemMessage } from '../../../../../../models/portal-models';
import PortalCommunicator from '../../../../../../portal-communicator';
import { PortalContext } from '../../../../../../PortalContext';
import { ThemeExtended } from '../../../../../../theme/SemanticColorsExtended';
import { ThemeContext } from '../../../../../../ThemeContext';
import BindingCard, { BindingCardChildProps } from './BindingCard';
import { listStyle } from './BindingCard.styles';

const FunctionNameBindingCard: React.SFC<BindingCardChildProps> = props => {
  const { functionInfo } = props;
  const { t } = useTranslation();
  const theme = useContext(ThemeContext);
  const portalCommunicator = useContext(PortalContext);

  const content = getContent(theme, functionInfo, portalCommunicator);

  return <BindingCard title={t('_function')} Svg={FunctionSvg} content={content} {...props} />;
};

const getContent = (theme: ThemeExtended, functionInfo: ArmObj<FunctionInfo>, portalCommunicator: PortalCommunicator): JSX.Element => {
  return (
    <ul className={listStyle(theme)}>
      <li key={'0'}>
        <Link onClick={() => onClick(portalCommunicator, functionInfo.id)}>{functionInfo.properties.name}</Link>
      </li>
    </ul>
  );
};

const onClick = (portalCommunicator: PortalCommunicator, id: string) => {
  portalCommunicator.broadcastMessage<SelectedMenuItemMessage>(BroadcastMessageId.menuItemSelected, id, { menuId: MenuId.Code });
};

export default FunctionNameBindingCard;
