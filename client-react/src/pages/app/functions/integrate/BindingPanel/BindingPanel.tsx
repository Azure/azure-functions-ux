import i18next from 'i18next';
import { PanelType } from 'office-ui-fabric-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Panel from '../../../../../components/Panel/Panel';
import { ArmObj } from '../../../../../models/arm-obj';
import { Binding, BindingDirection } from '../../../../../models/functions/binding';
import { BindingInfo } from '../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import BindingCreator from './BindingCreator';
import BindingEditor from './BindingEditor';

export interface BindingPanelProps {
  functionAppId: string;
  functionAppRuntimeVersion: string;
  functionAppSystemKey: string;
  functionInfo: ArmObj<FunctionInfo>;
  bindings: Binding[];
  bindingInfo?: BindingInfo;
  bindingDirection: BindingDirection;
  isOpen: boolean;
  onPanelClose: () => void;
  onSubmit: (newBindingInfo: BindingInfo, currentBindingInfo?: BindingInfo) => void;
  onDelete: (currentBindingInfo: BindingInfo) => void;
  setRequiredBindingId: (id: string) => void;
}

const BindingPanel: React.SFC<BindingPanelProps> = props => {
  const {
    functionAppId,
    functionAppRuntimeVersion,
    functionAppSystemKey,
    functionInfo,
    bindings,
    bindingInfo,
    bindingDirection,
    isOpen,
    onPanelClose,
    onSubmit,
    onDelete,
    setRequiredBindingId,
  } = props;
  const { t } = useTranslation();

  return (
    <Panel
      isOpen={isOpen}
      type={PanelType.smallFixedFar}
      headerText={getPanelHeader(t, bindingDirection, bindingInfo)}
      onDismiss={onPanelClose}>
      <div style={{ marginTop: '10px' }}>
        {isOpen &&
          (!bindingInfo ? (
            <BindingCreator
              bindings={bindings}
              functionAppId={functionAppId}
              bindingDirection={bindingDirection}
              setRequiredBindingId={setRequiredBindingId}
              {...props}
            />
          ) : (
            <BindingEditor
              functionAppRuntimeVersion={functionAppRuntimeVersion}
              functionAppSystemKey={functionAppSystemKey}
              functionInfo={functionInfo}
              allBindings={bindings}
              currentBindingInfo={bindingInfo}
              functionAppId={functionAppId}
              onSubmit={onSubmit}
              onDelete={onDelete}
            />
          ))}
      </div>
    </Panel>
  );
};

// If binding info is undefined that means you are creating a new binding info, otherwise you are editing
const getPanelHeader = (t: i18next.TFunction, bindingDirection: BindingDirection, bindingInfo?: BindingInfo) => {
  if (!bindingInfo) {
    switch (bindingDirection) {
      case BindingDirection.in: {
        return t('integrateCreateInput');
      }
      case BindingDirection.out: {
        return t('integrateCreateOutput');
      }
      default: {
        return t('integrateCreateTrigger');
      }
    }
  }

  switch (bindingDirection) {
    case BindingDirection.in: {
      return t('editBindingInput');
    }
    case BindingDirection.out: {
      return t('editBindingOutput');
    }
    default: {
      return t('editBindingTrigger');
    }
  }
};

export default BindingPanel;
