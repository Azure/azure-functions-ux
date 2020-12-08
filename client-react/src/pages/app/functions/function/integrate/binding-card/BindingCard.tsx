import i18next from 'i18next';
import React, { useContext } from 'react';
import { first } from 'rxjs/operators';
import { getErrorMessage } from '../../../../../../ApiHelpers/ArmHelper';
import FunctionsService from '../../../../../../ApiHelpers/FunctionsService';
import SiteService from '../../../../../../ApiHelpers/SiteService';
import { ArmObj } from '../../../../../../models/arm-obj';
import { Binding, BindingDirection } from '../../../../../../models/functions/binding';
import { BindingInfo } from '../../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../../models/functions/function-info';
import PortalCommunicator from '../../../../../../portal-communicator';
import { ThemeContext } from '../../../../../../ThemeContext';
import { ArmFunctionDescriptor } from '../../../../../../utils/resourceDescriptors';
import { ClosedReason } from '../BindingPanel/BindingEditor';
import { BindingEditorContextInfo } from '../FunctionIntegrate';
import { FunctionIntegrateConstants } from '../FunctionIntegrateConstants';
import { cardStyle, headerStyle } from './BindingCard.styles';

export interface BindingCardChildProps {
  functionInfo: ArmObj<FunctionInfo>;
  bindings: Binding[];
}

export interface EditableBindingCardProps extends BindingCardChildProps {
  readOnly: boolean;
  loadBindingSettings: (bindingId: string, force: boolean) => Promise<void>;
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
        createOrUpdateBinding(bindingEditorContext, portalCommunicator, t, functionInfo, info.newBindingInfo as BindingInfo);
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
        createOrUpdateBinding(
          bindingEditorContext,
          portalCommunicator,
          t,
          functionInfo,
          info.newBindingInfo as BindingInfo,
          info.currentBindingInfo
        );
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

const createOrUpdateBinding = (
  bindingEditorContext: BindingEditorContextInfo,
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction,
  functionInfo: ArmObj<FunctionInfo>,
  newBindingInfo: BindingInfo,
  currentBindingInfo?: BindingInfo
) => {
  bindingEditorContext.setIsUpdating(true);

  const updatedFunctionInfo = {
    ...functionInfo,
  };
  const bindings = [...updatedFunctionInfo.properties.config.bindings];
  const index = functionInfo.properties.config.bindings.findIndex(b => b === currentBindingInfo);

  if (newBindingInfo['newAppSettings']) {
    const updateAppSettingsNotificationId = portalCommunicator.startNotification(t('configUpdating'), t('configUpdating'));
    const armFunctionDescriptor = new ArmFunctionDescriptor(functionInfo.id);

    SiteService.updateApplicationSettings(armFunctionDescriptor.getSiteOnlyResourceId(), newBindingInfo['newAppSettings']).then(r => {
      if (!r.metadata.success) {
        const errorMessage = getErrorMessage(r.metadata.error) || t('configUpdateFailure');
        portalCommunicator.stopNotification(updateAppSettingsNotificationId, false, errorMessage);
      } else {
        portalCommunicator.stopNotification(updateAppSettingsNotificationId, true, t('configUpdateSuccess'));
      }
    });
  }

  // Delete data that isn't needed in function.json
  delete newBindingInfo['newAppSettings'];
  for (const field in newBindingInfo) {
    // Delete rules and empty data
    if (field.startsWith(FunctionIntegrateConstants.rulePrefix) || !newBindingInfo[field]) {
      delete newBindingInfo[field];
    }
  }

  if (index > -1) {
    bindings[index] = newBindingInfo;
  } else {
    bindings.push(newBindingInfo);
  }

  updatedFunctionInfo.properties.config = {
    ...updatedFunctionInfo.properties.config,
    bindings,
  };

  const updateBindingNotificationId = portalCommunicator.startNotification(
    t('updateBindingNotification'),
    t('updateBindingNotificationDetails').format(updatedFunctionInfo.properties.name, newBindingInfo.name)
  );

  FunctionsService.updateFunction(functionInfo.id, updatedFunctionInfo).then(r => {
    if (!r.metadata.success) {
      // Refresh on failure to get actual state
      bindingEditorContext.refreshIntegrate();

      const errorMessage = getErrorMessage(r.metadata.error) || '';
      portalCommunicator.stopNotification(
        updateBindingNotificationId,
        false,
        t('updateBindingNotificationFailed').format(updatedFunctionInfo.properties.name, newBindingInfo.name, errorMessage)
      );
    } else {
      bindingEditorContext.updateFunctionInfo(updatedFunctionInfo);

      portalCommunicator.stopNotification(
        updateBindingNotificationId,
        true,
        t('updateBindingNotificationSuccess').format(updatedFunctionInfo.properties.name, newBindingInfo.name)
      );
    }

    bindingEditorContext.setIsUpdating(false);
  });

  bindingEditorContext.closeEditor();
};

export const deleteBinding = (
  bindingEditorContext: BindingEditorContextInfo,
  portalCommunicator: PortalCommunicator,
  t: i18next.TFunction,
  functionInfo: ArmObj<FunctionInfo>,
  currentBindingInfo: BindingInfo
) => {
  bindingEditorContext.setIsUpdating(true);

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
        // Refresh on failure to get actual state
        bindingEditorContext.refreshIntegrate();

        const errorMessage = getErrorMessage(r.metadata.error) || '';
        portalCommunicator.stopNotification(
          notificationId,
          false,
          t('deleteBindingNotificationFailed').format(updatedFunctionInfo.properties.name, currentBindingInfo.name, errorMessage)
        );
      } else {
        bindingEditorContext.updateFunctionInfo(r.data);

        portalCommunicator.stopNotification(
          notificationId,
          true,
          t('deleteBindingNotificationSuccess').format(updatedFunctionInfo.properties.name, currentBindingInfo.name)
        );
      }

      bindingEditorContext.setIsUpdating(false);
    });

    bindingEditorContext.closeEditor();
  }
};

export default BindingCard;
