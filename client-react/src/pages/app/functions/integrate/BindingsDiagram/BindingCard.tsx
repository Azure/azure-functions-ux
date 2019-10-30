import i18next from 'i18next';
import React, { useContext } from 'react';
import { first } from 'rxjs/operators';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { ArmObj } from '../../../../../models/arm-obj';
import { BindingConfigDirection } from '../../../../../models/functions/bindings-config';
import { BindingInfo } from '../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import PortalCommunicator from '../../../../../portal-communicator';
import { ThemeContext } from '../../../../../ThemeContext';
import { BindingEditorContextInfo } from '../FunctionIntegrate';
import { cardStyle, headerStyle } from './BindingDiagram.styles';
import { ClosedReason } from '../binding-editor/BindingEditor';

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
  bindingEditorContext: BindingEditorContextInfo,
  bindingDirection: BindingConfigDirection
) => {
  bindingEditorContext
    .openEditor(bindingDirection)
    .pipe(first())
    .subscribe(info => {
      if (info.closedReason === ClosedReason.Save) {
        const newFunctionInfo = submit(portalCommunicator, t, functionInfo, info.newBindingInfo as BindingInfo);

        bindingEditorContext.closeEditor();
        bindingEditorContext.updateFunctionInfo(newFunctionInfo);
      }
    });
};

export const editExisting = (
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction,
  functionInfo: ArmObj<FunctionInfo>,
  functionBinding: BindingInfo,
  bindingEditorContext: BindingEditorContextInfo,
  bindingDirection: BindingConfigDirection
) => {
  bindingEditorContext
    .openEditor(bindingDirection, functionBinding)
    .pipe(first())
    .subscribe(info => {
      if (info.closedReason === ClosedReason.Save) {
        const newFunctionInfo = submit(portalCommunicator, t, functionInfo, info.newBindingInfo as BindingInfo, info.currentBindingInfo);

        bindingEditorContext.closeEditor();
        bindingEditorContext.updateFunctionInfo(newFunctionInfo);
      } else if (info.closedReason === ClosedReason.Delete) {
        deleteBinding(bindingEditorContext, portalCommunicator, t, functionInfo, info.currentBindingInfo as BindingInfo);
      }
    });
};

export const emptyList = (emptyMessage: string): JSX.Element[] => {
  return [
    <li key={'emptyInputs'} className="emptyMessage">
      {emptyMessage}
    </li>,
  ];
};

const submit = (
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction,
  functionInfo: ArmObj<FunctionInfo>,
  newBindingInfo: BindingInfo,
  currentBindingInfo?: BindingInfo
): ArmObj<FunctionInfo> => {
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

  return newFunctionInfo;
};

export const deleteBinding = (
  bindingEditorContext: BindingEditorContextInfo,
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction,
  functionInfo: ArmObj<FunctionInfo>,
  currentBindingInfo: BindingInfo
) => {
  const newFunctionInfo = {
    ...functionInfo,
  };

  const bindings = [...newFunctionInfo.properties.config.bindings];
  const index = functionInfo.properties.config.bindings.findIndex(b => b === currentBindingInfo);

  if (index > -1) {
    bindings.splice(index, 1);
  }

  newFunctionInfo.properties.config = {
    ...newFunctionInfo.properties.config,
    bindings,
  };

  const notificationId = portalCommunicator.startNotification(
    t('deleteBindingNotification'),
    t('deleteBindingNotificationDetails').format(newFunctionInfo.properties.name, currentBindingInfo.name)
  );

  FunctionsService.updateFunction(functionInfo.id, newFunctionInfo).then(r => {
    if (!r.metadata.success) {
      const errorMessage = r.metadata.error ? r.metadata.error.Message : '';
      portalCommunicator.stopNotification(
        notificationId,
        false,
        t('deleteBindingNotificationFailed').format(newFunctionInfo.properties.name, currentBindingInfo.name, errorMessage)
      );

      return;
    }

    portalCommunicator.stopNotification(
      notificationId,
      true,
      t('deleteBindingNotificationSuccess').format(newFunctionInfo.properties.name, currentBindingInfo.name)
    );

    bindingEditorContext.closeEditor();
    bindingEditorContext.updateFunctionInfo(newFunctionInfo);
  });
};

export default BindingCard;
