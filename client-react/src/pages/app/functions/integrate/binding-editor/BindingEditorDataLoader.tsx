import React, { useEffect, useState } from 'react';
import LoadingComponent from '../../../../../components/loading/loading-component';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { BindingConfigMetadata, BindingConfigDirection } from '../../../../../models/functions/bindings-config';
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
  bindingInfo?: BindingInfo;
  onPanelClose: () => void;
  onSubmit: (newBindingInfo: BindingInfo, currentBindingInfo?: BindingInfo) => void;
}

const BindingEditorDataLoader: React.SFC<BindingEditorDataLoaderProps> = props => {
  const { functionInfo, bindingInfo } = props;
  const [bindingsMetadata, setBindingsMetadata] = useState<BindingConfigMetadata[] | undefined>(undefined);
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

      setBindingsMetadata(r.data.bindings);
    });
  }, []);

  if (!bindingInfo || !bindingsMetadata) {
    return null;
  }

  return (
    <Panel type={PanelType.smallFixedFar} headerText={getPanelHeader(bindingInfo, t)} onDismiss={props.onPanelClose}>
      {getEditorOrLoader(functionInfo, props.onSubmit, bindingInfo, bindingsMetadata)}
    </Panel>
  );
};

const getEditorOrLoader = (
  functionInfo: ArmObj<FunctionInfo>,
  onSubmit: (bindingInfo: BindingInfo) => void,
  bindingInfo?: BindingInfo,
  bindingsMetadata?: BindingConfigMetadata[]
) => {
  if (bindingsMetadata && bindingInfo) {
    return (
      <BindingEditor
        functionInfo={functionInfo}
        allBindingsConfigMetadata={bindingsMetadata}
        currentBindingInfo={bindingInfo}
        onSubmit={onSubmit}
      />
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
