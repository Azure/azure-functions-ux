import React, { useRef, useState } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { Stack } from 'office-ui-fabric-react';
import TriggerBindingCard from './BindingsDiagram/TriggerBindingCard';
import OutputBindingCard from './BindingsDiagram/OutputBindingCard';
import InputBindingCard from './BindingsDiagram/InputBindingCard';
import FunctionNameBindingCard from './BindingsDiagram/FunctionNameBindingCard';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { Subject, Observable } from 'rxjs';
import BindingEditorDataLoader from './binding-editor/BindingEditorDataLoader';

export interface FunctionIntegrateProps {
  functionInfo: ArmObj<FunctionInfo>;
  functionAppId: string;
}

const paddingStyle = {
  padding: '20px',
};

export interface BindingUpdateInfo {
  newBindingInfo?: BindingInfo;
  currentBindingInfo?: BindingInfo;
  closedReason: 'cancel' | 'save' | 'delete';
}

export interface BindingEditorContextInfo {
  openEditor: (bindingInfo: BindingInfo) => Observable<BindingUpdateInfo>;
  closeEditor: () => void;
  updateFunctionInfo: React.Dispatch<React.SetStateAction<ArmObj<FunctionInfo>>>;
}

export const BindingEditorContext = React.createContext<BindingEditorContextInfo | null>(null);

export const FunctionIntegrate: React.SFC<FunctionIntegrateProps> = props => {
  const { functionInfo: initialFunctionInfo, functionAppId } = props;

  const bindingUpdate$ = useRef(new Subject<BindingUpdateInfo>());
  const [bindingToUpdate, setBindingToUpdate] = useState<BindingInfo | undefined>(undefined);
  const [functionInfo, setFunctionInfo] = useState<ArmObj<FunctionInfo>>(initialFunctionInfo);

  const openEditor = (bindingInfo: BindingInfo): Observable<BindingUpdateInfo> => {
    setBindingToUpdate(bindingInfo);
    return bindingUpdate$.current;
  };

  const closeEditor = () => {
    setBindingToUpdate(undefined);
  };

  const onSubmit = (newBindingInfo: BindingInfo, currentBindingInfo?: BindingInfo) => {
    bindingUpdate$.current.next({
      newBindingInfo,
      currentBindingInfo,
      closedReason: 'save',
    });
  };

  const onCancel = () => {
    bindingUpdate$.current.next({
      newBindingInfo: undefined,
      currentBindingInfo: bindingToUpdate,
      closedReason: 'cancel',
    });

    setBindingToUpdate(undefined);
  };

  const editorContext: BindingEditorContextInfo = {
    openEditor,
    closeEditor,
    updateFunctionInfo: setFunctionInfo,
  };

  return (
    <>
      <BindingEditorContext.Provider value={editorContext}>
        <BindingEditorDataLoader
          functionInfo={functionInfo}
          functionAppId={functionAppId}
          bindingInfo={bindingToUpdate}
          onPanelClose={onCancel}
          onSubmit={onSubmit}
        />

        <div style={paddingStyle}>
          <Stack horizontal gap={50} horizontalAlign={'center'} disableShrink>
            <Stack.Item grow>
              <Stack gap={100}>
                <TriggerBindingCard functionInfo={functionInfo} />
                <InputBindingCard functionInfo={functionInfo} />
              </Stack>
            </Stack.Item>
            <Stack.Item grow>
              <Stack verticalAlign="center" verticalFill={true}>
                <FunctionNameBindingCard functionInfo={functionInfo} />
              </Stack>
            </Stack.Item>
            <Stack.Item grow>
              <Stack verticalAlign="center" verticalFill={true}>
                <OutputBindingCard functionInfo={functionInfo} />
              </Stack>
            </Stack.Item>
          </Stack>
        </div>
      </BindingEditorContext.Provider>
    </>
  );
};
