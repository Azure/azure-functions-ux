import i18next from 'i18next';
import React, { useContext } from 'react';
import { first } from 'rxjs/operators';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { ArmObj } from '../../../../../models/arm-obj';
import { Binding, BindingDirection } from '../../../../../models/functions/binding';
import { BindingInfo } from '../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import PortalCommunicator from '../../../../../portal-communicator';
import { ThemeContext } from '../../../../../ThemeContext';
import { ClosedReason } from '../BindingPanel/BindingEditor';
import { BindingEditorContextInfo } from '../FunctionIntegrate';
import { cardStyle, headerStyle } from './BindingDiagram.styles';

export interface BindingCardChildProps {
  functionInfo: ArmObj<FunctionInfo>;
  bindings: Binding[];
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
  bindingDirection: BindingDirection
) => {
  bindingEditorContext
    .openEditor(bindingDirection)
    .pipe(first())
    .subscribe(info => {
      if (info.closedReason === ClosedReason.Save) {
        const updatedFunctionInfo = submit(portalCommunicator, t, functionInfo, info.newBindingInfo as BindingInfo);

        bindingEditorContext.closeEditor();
        bindingEditorContext.updateFunctionInfo(updatedFunctionInfo);
      }
    });
};

export const editExisting = (
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction,
  functionInfo: ArmObj<FunctionInfo>,
  functionBinding: BindingInfo,
  bindingEditorContext: BindingEditorContextInfo,
  bindingDirection: BindingDirection
) => {
  bindingEditorContext
    .openEditor(bindingDirection, functionBinding)
    .pipe(first())
    .subscribe(info => {
      if (info.closedReason === ClosedReason.Save) {
        const updatedFunctionInfo = submit(
          portalCommunicator,
          t,
          functionInfo,
          info.newBindingInfo as BindingInfo,
          info.currentBindingInfo
        );

        bindingEditorContext.closeEditor();
        bindingEditorContext.updateFunctionInfo(updatedFunctionInfo);
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
  const updatedFunctionInfo = {
    ...functionInfo,
  };

  const bindings = [...updatedFunctionInfo.properties.config.bindings];
  const index = functionInfo.properties.config.bindings.findIndex(b => b === currentBindingInfo);

  if (index > -1) {
    bindings[index] = newBindingInfo;
  } else {
    bindings.push(newBindingInfo);
  }

  updatedFunctionInfo.properties.config = {
    ...updatedFunctionInfo.properties.config,
    bindings,
  };

  const notificationId = portalCommunicator.startNotification(
    t('updateBindingNotification'),
    t('updateBindingNotificationDetails').format(updatedFunctionInfo.properties.name, newBindingInfo.name)
  );

  FunctionsService.updateFunction(functionInfo.id, updatedFunctionInfo).then(r => {
    if (!r.metadata.success) {
      const errorMessage = r.metadata.error ? r.metadata.error.Message : '';
      portalCommunicator.stopNotification(
        notificationId,
        false,
        t('updateBindingNotificationFailed').format(updatedFunctionInfo.properties.name, newBindingInfo.name, errorMessage)
      );

      return;
    }

    portalCommunicator.stopNotification(
      notificationId,
      true,
      t('updateBindingNotificationSuccess').format(updatedFunctionInfo.properties.name, newBindingInfo.name)
    );
  });

  return updatedFunctionInfo;
};

export const deleteBinding = (
  bindingEditorContext: BindingEditorContextInfo,
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction,
  functionInfo: ArmObj<FunctionInfo>,
  currentBindingInfo: BindingInfo
) => {
  const updatedFunctionInfo = {
    ...functionInfo,
  };

  const bindings = [...updatedFunctionInfo.properties.config.bindings];
  const index = functionInfo.properties.config.bindings.findIndex(b => b === currentBindingInfo);

  if (index > -1) {
    bindings.splice(index, 1);

    updatedFunctionInfo.properties.config = {
      ...updatedFunctionInfo.properties.config,
      bindings,
    };

    const notificationId = portalCommunicator.startNotification(
      t('deleteBindingNotification'),
      t('deleteBindingNotificationDetails').format(updatedFunctionInfo.properties.name, currentBindingInfo.name)
    );

    FunctionsService.updateFunction(functionInfo.id, updatedFunctionInfo).then(r => {
      if (!r.metadata.success) {
        const errorMessage = r.metadata.error ? r.metadata.error.Message : '';
        portalCommunicator.stopNotification(
          notificationId,
          false,
          t('deleteBindingNotificationFailed').format(updatedFunctionInfo.properties.name, currentBindingInfo.name, errorMessage)
        );

        return;
      }

      portalCommunicator.stopNotification(
        notificationId,
        true,
        t('deleteBindingNotificationSuccess').format(updatedFunctionInfo.properties.name, currentBindingInfo.name)
      );
    });
  }

  bindingEditorContext.closeEditor();
  bindingEditorContext.updateFunctionInfo(updatedFunctionInfo);
};

export default BindingCard;
