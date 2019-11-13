import React, { useContext } from 'react';
import BindingCard, { BindingCardChildProps } from './BindingCard';
import { ReactComponent as FunctionSvg } from '../../../../../images/AppService/functions_f.svg';
import { useTranslation } from 'react-i18next';
import { Link } from 'office-ui-fabric-react';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';
import { listStyle } from './BindingDiagram.styles';
import { ThemeContext } from '../../../../../ThemeContext';
import { PortalContext } from '../../../../../PortalContext';
import { BroadcastMessageId, SelectedMenuItemMessage } from '../../../../../models/portal-models';
import PortalCommunicator from '../../../../../portal-communicator';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';

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
  portalCommunicator.broadcastMessage<SelectedMenuItemMessage>(BroadcastMessageId.menuItemSelected, id, { menuId: 'code' });
};

export default FunctionNameBindingCard;
