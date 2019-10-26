import React, { useRef, useState, useContext } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { Stack, IStackTokens } from 'office-ui-fabric-react';
import TriggerBindingCard from './BindingsDiagram/TriggerBindingCard';
import OutputBindingCard from './BindingsDiagram/OutputBindingCard';
import InputBindingCard from './BindingsDiagram/InputBindingCard';
import FunctionNameBindingCard from './BindingsDiagram/FunctionNameBindingCard';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { Subject, Observable } from 'rxjs';
import BindingEditorDataLoader from './binding-editor/BindingEditorDataLoader';
import { ReactComponent as DoubleArrow } from '../../../../images/Functions/double-arrow-left-right.svg';
import { ReactComponent as SingleArrow } from '../../../../images/Functions/single-arrow-left-right.svg';
import { classes } from 'typestyle';
import {
  diagramWrapperStyle,
  doubleArrowStyle,
  singleCardStackStyle,
  singleArrowStyle,
  defaultArrowStyle,
  arrowProps,
} from './FunctionIntegrate.style';
import { ThemeContext } from '../../../../ThemeContext';

export interface FunctionIntegrateProps {
  functionInfo: ArmObj<FunctionInfo>;
}

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
  const { functionInfo: initialFunctionInfo } = props;
  const theme = useContext(ThemeContext);

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
  const functionAppId = functionInfo.properties.function_app_id || functionInfo.id.split('/function')[0];

  const tokens: IStackTokens = {
    childrenGap: 0,
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

        <div className={diagramWrapperStyle}>
          <Stack horizontal horizontalAlign={'center'} tokens={tokens}>
            <Stack.Item grow>
              <Stack gap={40}>
                <TriggerBindingCard functionInfo={functionInfo} />
                <InputBindingCard functionInfo={functionInfo} />
              </Stack>
            </Stack.Item>

            <Stack.Item grow>
              <DoubleArrow className={classes(defaultArrowStyle(theme), doubleArrowStyle)} {...arrowProps} />
            </Stack.Item>

            <Stack.Item grow>
              <Stack verticalFill={true} className={singleCardStackStyle}>
                <FunctionNameBindingCard functionInfo={functionInfo} />
              </Stack>
            </Stack.Item>

            <Stack.Item grow>
              <SingleArrow className={classes(defaultArrowStyle(theme), singleArrowStyle)} {...arrowProps} />
            </Stack.Item>

            <Stack.Item grow>
              <Stack verticalFill={true} className={singleCardStackStyle}>
                <OutputBindingCard functionInfo={functionInfo} />
              </Stack>
            </Stack.Item>
          </Stack>
        </div>
      </BindingEditorContext.Provider>
    </>
  );
};
