import i18next from 'i18next';
import { PanelType } from 'office-ui-fabric-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Panel from '../../../../../components/Panel/Panel';
import { ArmObj } from '../../../../../models/arm-obj';
import { BindingConfigDirection, BindingsConfig } from '../../../../../models/functions/bindings-config';
import { BindingInfo } from '../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import BindingCreator from './BindingCreator';
import BindingEditor from './BindingEditor';

export interface BindingPanelProps {
  functionInfo: ArmObj<FunctionInfo>;
  functionAppId: string;
  bindingsConfig: BindingsConfig;
  bindingInfo?: BindingInfo;
  bindingDirection: BindingConfigDirection;
  isOpen: boolean;
  onPanelClose: () => void;
  onSubmit: (newBindingInfo: BindingInfo, currentBindingInfo?: BindingInfo) => void;
  onDelete: (currentBindingInfo: BindingInfo) => void;
}

const BindingPanel: React.SFC<BindingPanelProps> = props => {
  const { functionInfo, functionAppId, bindingsConfig, bindingInfo, bindingDirection, isOpen, onPanelClose, onSubmit, onDelete } = props;
  const { t } = useTranslation();

  {
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
                bindingsConfig={bindingsConfig}
                functionAppId={functionAppId}
                bindingDirection={bindingDirection}
                {...props}
              />
            ) : (
              <BindingEditor
                functionInfo={functionInfo}
                allBindingsConfig={bindingsConfig}
                currentBindingInfo={bindingInfo}
                resourceId={functionAppId}
                onSubmit={onSubmit}
                onDelete={onDelete}
              />
            ))}
        </div>
      </Panel>
    );
  }
};

// If binding info is undefined that means you are creating a new binding info, otherwise you are editing
const getPanelHeader = (t: i18next.TFunction, bindingDirection: BindingConfigDirection, bindingInfo?: BindingInfo) => {
  if (!bindingInfo) {
    switch (bindingDirection) {
      case BindingConfigDirection.in: {
        return t('integrateCreateInput');
      }
      case BindingConfigDirection.out: {
        return t('integrateCreateOutput');
      }
    }
  }

  switch (bindingDirection) {
    case BindingConfigDirection.in: {
      return t('editBindingInput');
    }
    case BindingConfigDirection.out: {
      return t('editBindingOutput');
    }
    default: {
      return t('editBindingTrigger');
    }
  }
};

export default BindingPanel;
