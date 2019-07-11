import React, { useContext, useState } from 'react';
import { BindingInfo, BindingDirection } from '../../../../../models/functions/function-binding';
import { Link } from 'office-ui-fabric-react';
import { ThemeContext } from '../../../../../ThemeContext';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { getCardStyle, getHeaderStyle, listStyle } from './DataFlowDiagram.styles';
import BindingEditorDataLoader from '../binding-editor/BindingEditorDataLoader';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { ArmObj } from '../../../../../models/arm-obj';
import { getBindingConfigDirection } from '../binding-editor/BindingEditor';
import { BindingConfigDirection } from '../../../../../models/functions/bindings-config';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import PortalCommunicator from '../../../../../portal-communicator';
import { PortalContext } from '../../../../../PortalContext';

export interface DataFlowCardChildProps {
  functionInfo: ArmObj<FunctionInfo>;
}

export interface DataFlowCardProps extends DataFlowCardChildProps {
  items: BindingInfo[];
  title: string;
  Svg: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  emptyMessage: string;
  supportsMultipleItems?: boolean;

  // Only used for the FunctionDataFlowCard.  When set, it doesn't show links or an add button
  functionName?: string;
}

export interface DataFlowCardState {
  items: BindingInfo[];
}

const DataFlowCard: React.SFC<DataFlowCardProps> = props => {
  const { functionInfo, title, emptyMessage, Svg, functionName, items, supportsMultipleItems } = props;

  const theme = useContext(ThemeContext);
  const { t } = useTranslation();
  const portalCommunicator = useContext(PortalContext);
  const [bindingInfoToEdit, setBindingInfoToEdit] = useState<BindingInfo | undefined>(undefined);

  return (
    <>
      {getBindingEditorPanel(portalCommunicator, t, setBindingInfoToEdit, functionInfo, bindingInfoToEdit)}
      <div className={getCardStyle(theme)}>
        <div className={getHeaderStyle(theme)}>
          <h3>{title}</h3>
          <Svg />
        </div>
        {getItemsList(items, emptyMessage, t, setBindingInfoToEdit, functionName, supportsMultipleItems)}
      </div>
    </>
  );
};

const getBindingEditorPanel = (
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction,
  setBindingInfoToEdit: React.Dispatch<React.SetStateAction<BindingInfo | undefined>>,
  functionInfo: ArmObj<FunctionInfo>,
  bindingInfo?: BindingInfo
) => {
  const onPanelClose = () => {
    setBindingInfoToEdit(undefined);
  };

  const onSubmit = (newBindingInfo: BindingInfo, currentBindingInfo?: BindingInfo) => {
    setBindingInfoToEdit(undefined);
    submit(portalCommunicator, t, functionInfo, newBindingInfo, currentBindingInfo);
  };

  if (bindingInfo) {
    return (
      <BindingEditorDataLoader functionInfo={functionInfo} bindingInfo={bindingInfo} onPanelClose={onPanelClose} onSubmit={onSubmit} />
    );
  }
};

const submit = (
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction,
  functionInfo: ArmObj<FunctionInfo>,
  newBindingInfo: BindingInfo,
  currentBindingInfo?: BindingInfo
) => {
  const newFunctionInfo = {
    ...functionInfo,
  };

  const bindings = [...newFunctionInfo.properties.config.bindings];
  const index = functionInfo.properties.config.bindings.findIndex(b => b === currentBindingInfo);

  if (index > -1) {
    bindings[index] = newBindingInfo;
  } else {
    bindings.push(newBindingInfo);
  }

  newFunctionInfo.properties.config = {
    ...newFunctionInfo.properties.config,
    bindings,
  };

  const notificationId = portalCommunicator.startNotification(
    t('updateBindingNotification'),
    t('updateBindingNotificationDetails').format(newFunctionInfo.properties.name, newBindingInfo.name)
  );

  FunctionsService.updateFunction(functionInfo.id, newFunctionInfo).then(r => {
    if (!r.metadata.success) {
      const errorMessage = r.metadata.error ? r.metadata.error.Message : '';
      portalCommunicator.stopNotification(
        notificationId,
        false,
        t('updateBindingNotificationFailed').format(newFunctionInfo.properties.name, newBindingInfo.name, errorMessage)
      );

      return;
    }

    portalCommunicator.stopNotification(
      notificationId,
      true,
      t('updateBindingNotificationSuccess').format(newFunctionInfo.properties.name, newBindingInfo.name)
    );
  });
};

const getItemsList = (
  items: BindingInfo[],
  emptyMessage: string,
  t: i18next.TFunction,
  setBindingInfoToEdit: React.Dispatch<React.SetStateAction<BindingInfo | undefined>>,
  functionName?: string,
  supportsMultipleItems?: boolean
) => {
  let list: JSX.Element[] = [];

  if (functionName) {
    list.push(
      <li key={'0'}>
        <Link>{functionName}</Link>
      </li>
    );
  } else if (items.length === 0) {
    list.push(
      <li key={'0'} className="emptyMessage">
        {emptyMessage}
      </li>
    );
  } else {
    list = items.map((item, i) => {
      const name = item.name ? `(${item.name})` : '';
      const linkName = `${item.type} ${name}`;
      return (
        <li key={i.toString()}>
          <Link onClick={() => onClick(item, setBindingInfoToEdit)}>{linkName}</Link>
        </li>
      );
    });
  }

  if (supportsMultipleItems) {
    list.push(
      <li key={list.length}>
        <Link>{t('integrateAddInput')}</Link>
      </li>
    );
  }

  return <ul className={listStyle}>{list}</ul>;
};

export const getTriggers = (bindings: BindingInfo[]) => {
  const trigger = bindings.find(b => {
    return getBindingConfigDirection(b) === BindingConfigDirection.trigger;
  });

  return trigger ? [trigger] : [];
};

export const getBindings = (bindings: BindingInfo[], direction: BindingDirection) => {
  return bindings.filter(b => {
    return getBindingConfigDirection(b).toString() === direction.toString();
  });
};

const onClick = (functionBinding: BindingInfo, setBindingInfoToEdit: React.Dispatch<React.SetStateAction<BindingInfo | undefined>>) => {
  setBindingInfoToEdit(functionBinding);
};

export default DataFlowCard;
