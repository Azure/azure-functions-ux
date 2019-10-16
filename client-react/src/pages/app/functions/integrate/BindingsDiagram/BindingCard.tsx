import React, { useContext } from 'react';
import { BindingInfo, BindingDirection } from '../../../../../models/functions/function-binding';
import { ThemeContext } from '../../../../../ThemeContext';
import i18next from 'i18next';
import { cardStyle, headerStyle } from './BindingDiagram.styles';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { ArmObj } from '../../../../../models/arm-obj';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import PortalCommunicator from '../../../../../portal-communicator';
import { BindingEditorContextInfo } from '../FunctionIntegrate';
import { first } from 'rxjs/operators';
import { BindingConfigMetadata, BindingsConfig, BindingConfigDirection } from '../../../../../models/functions/bindings-config';

export interface BindingCardChildProps {
  functionInfo: ArmObj<FunctionInfo>;
}

export interface BindingCardProps extends BindingCardChildProps {
  title: string;
  Svg: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  content: JSX.Element;
}

const BindingCard: React.SFC<BindingCardProps> = props => {
  const { title, Svg, content } = props;

  const theme = useContext(ThemeContext);

  return (
    <>
      <div className={cardStyle(theme)}>
        <div className={headerStyle(theme)}>
          <h3>{title}</h3>
          <Svg />
        </div>
        {content}
      </div>
    </>
  );
};

export const createNew = (
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction,
  functionInfo: ArmObj<FunctionInfo>,
  functionBindings: BindingConfigMetadata[],
  bindingEditorContext: BindingEditorContextInfo
) => {
  const newBinding: BindingInfo = {
    name: '',
    type: '',
    direction: BindingDirection.in,
  };
  editExisting(portalCommunicator, t, functionInfo, newBinding, bindingEditorContext);
};

export const editExisting = (
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

export const emptyList = (emptyMessage: string): JSX.Element => {
  return (
    <li key={'0'} className="emptyMessage">
      {emptyMessage}
    </li>
  );
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
