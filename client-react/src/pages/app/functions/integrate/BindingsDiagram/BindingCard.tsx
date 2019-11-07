import React, { useContext } from 'react';
import { BindingInfo, BindingDirection } from '../../../../../models/functions/function-binding';
import { Link } from 'office-ui-fabric-react';
import { ThemeContext } from '../../../../../ThemeContext';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { cardStyle, headerStyle, listStyle } from './BindingDiagram.styles';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { ArmObj } from '../../../../../models/arm-obj';
import { getBindingConfigDirection } from '../binding-editor/BindingEditor';
import { BindingConfigDirection } from '../../../../../models/functions/bindings-config';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import PortalCommunicator from '../../../../../portal-communicator';
import { PortalContext } from '../../../../../PortalContext';
import { BindingEditorContext, BindingEditorContextInfo } from '../FunctionIntegrate';
import { first } from 'rxjs/operators';
import { ThemeExtended } from '../../../../../theme/SemanticColorsExtended';

export interface BindingCardChildProps {
  functionInfo: ArmObj<FunctionInfo>;
}

export interface BindingCardProps extends BindingCardChildProps {
  items: BindingInfo[];
  title: string;
  Svg: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  emptyMessage: string;
  supportsMultipleItems?: boolean;

  // Only used for the FunctionNameBindingCard.  When set, it doesn't show links or an add button
  functionName?: string;
}

export interface BindingCardState {
  items: BindingInfo[];
}

const BindingCard: React.SFC<BindingCardProps> = props => {
  const { functionInfo, title, emptyMessage, Svg, functionName, items, supportsMultipleItems } = props;

  const theme = useContext(ThemeContext);
  const portalCommunicator = useContext(PortalContext);

  const { t } = useTranslation();
  const bindingEditor = useContext(BindingEditorContext) as BindingEditorContextInfo;

  return (
    <>
      <div className={cardStyle(theme)}>
        <div className={headerStyle(theme)}>
          <h3>{title}</h3>
          <Svg />
        </div>
        {getItemsList(portalCommunicator, functionInfo, items, emptyMessage, t, bindingEditor, theme, functionName, supportsMultipleItems)}
      </div>
    </>
  );
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

const getItemsList = (
  portalCommunicator: PortalCommunicator,
  functionInfo: ArmObj<FunctionInfo>,
  items: BindingInfo[],
  emptyMessage: string,
  t: i18next.TFunction,
  bindingEditorContext: BindingEditorContextInfo,
  theme: ThemeExtended,
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
          <Link onClick={() => onClick(portalCommunicator, t, functionInfo, item, bindingEditorContext)}>{linkName}</Link>
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

  return <ul className={listStyle(theme)}>{list}</ul>;
};

const onClick = (
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction,
  functionInfo: ArmObj<FunctionInfo>,
  functionBinding: BindingInfo,
  bindingEditorContext: BindingEditorContextInfo
) => {
  bindingEditorContext
    .openEditor(functionBinding)
    .pipe(first())
    .subscribe(info => {
      if (info.closedReason === 'save') {
        submit(bindingEditorContext, portalCommunicator, t, functionInfo, info.newBindingInfo as BindingInfo, info.currentBindingInfo);
      }
    });
};

const submit = (
  bindingEditorContext: BindingEditorContextInfo,
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

    bindingEditorContext.closeEditor();
    bindingEditorContext.updateFunctionInfo(newFunctionInfo);
  });
};

export default BindingCard;
