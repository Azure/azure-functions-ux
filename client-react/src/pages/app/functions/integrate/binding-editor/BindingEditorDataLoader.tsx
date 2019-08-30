import React, { useEffect, useState } from 'react';
import LoadingComponent from '../../../../../components/loading/loading-component';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { BindingConfigDirection, BindingsConfig } from '../../../../../models/functions/bindings-config';
import BindingEditor, { getBindingConfigDirection } from './BindingEditor';
import { BindingInfo } from '../../../../../models/functions/function-binding';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { PanelType } from 'office-ui-fabric-react';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { ArmObj } from '../../../../../models/arm-obj';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import Panel from '../../../../../components/Panel/Panel';

export interface BindingEditorDataLoaderProps {
  functionInfo: ArmObj<FunctionInfo>;
  resourceId: string;
  bindingInfo?: BindingInfo;
  onPanelClose: () => void;
  onSubmit: (newBindingInfo: BindingInfo, currentBindingInfo?: BindingInfo) => void;
}

const BindingEditorDataLoader: React.SFC<BindingEditorDataLoaderProps> = props => {
  const { functionInfo, resourceId, bindingInfo } = props;
  const [bindingsConfig, setBindingsConfig] = useState<BindingsConfig | undefined>(undefined);
  const { t } = useTranslation();
  useEffect(() => {
    FunctionsService.getBindingConfigMetadata().then(r => {
      if (!r.metadata.success) {
        LogService.trackEvent(
          LogCategories.bindingEditor,
          'getBindingConfigMetadata',
          `Failed to get bindingConfigMetadata: ${r.metadata.error}`
        );
        return;
      }

      setBindingsConfig(r.data);
    });
  }, []);

  if (!bindingInfo || !bindingsConfig) {
    return null;
  }

  return (
    <Panel
      isOpen={true}
      type={PanelType.smallFixedFar}
      onRenderNavigationContent={() => onRenderNavigationContent(bindingInfo as BindingInfo, props.onPanelClose, t)}
      styles={panelStyle}>
      {getEditorOrLoader(functionInfo, resourceId, props.onSubmit, bindingInfo, bindingsConfig)}
    </Panel>
  );
};

const getEditorOrLoader = (
  functionInfo: ArmObj<FunctionInfo>,
  resourceId: string,
  onSubmit: (bindingInfo: BindingInfo) => void,
  bindingInfo?: BindingInfo,
  bindingsConfig?: BindingsConfig
) => {
  if (bindingsConfig && bindingInfo) {
    return (
      <div style={{ marginTop: '10px' }}>
        <BindingEditor
          functionInfo={functionInfo}
          allBindingsConfig={bindingsConfig}
          currentBindingInfo={bindingInfo}
          resourceId={resourceId}
          onSubmit={onSubmit}
        />
      </div>
    );
  }

  return <LoadingComponent />;
};

const getPanelHeader = (bindingInfo: BindingInfo, t: i18next.TFunction) => {
  const direction = getBindingConfigDirection(bindingInfo);
  switch (direction) {
    case BindingConfigDirection.in: {
      return t('editBindingInput');
    }
    case BindingConfigDirection.out: {
      return t('editBindingOuput');
    }
    default: {
      return t('editBindingTrigger');
    }
  }
};

export default BindingEditorDataLoader;
