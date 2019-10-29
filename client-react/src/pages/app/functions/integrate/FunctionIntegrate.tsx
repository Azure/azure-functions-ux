import { IStackTokens, Stack } from 'office-ui-fabric-react';
import React, { useContext, useRef, useState } from 'react';
import { Observable, Subject } from 'rxjs';
import { classes } from 'typestyle';
import { ReactComponent as DoubleArrow } from '../../../../images/Functions/double-arrow-left-right.svg';
import { ReactComponent as SingleArrow } from '../../../../images/Functions/single-arrow-left-right.svg';
import { ArmObj } from '../../../../models/arm-obj';
import { BindingConfigDirection } from '../../../../models/functions/bindings-config';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { ThemeContext } from '../../../../ThemeContext';
import BindingEditorDataLoader from './binding-editor/BindingEditorDataLoader';
import FunctionNameBindingCard from './BindingsDiagram/FunctionNameBindingCard';
import InputBindingCard from './BindingsDiagram/InputBindingCard';
import OutputBindingCard from './BindingsDiagram/OutputBindingCard';
import TriggerBindingCard from './BindingsDiagram/TriggerBindingCard';
import {
  arrowProps,
  defaultArrowStyle,
  diagramWrapperStyle,
  doubleArrowStyle,
  singleArrowStyle,
  singleCardStackStyle,
} from './FunctionIntegrate.style';

export interface FunctionIntegrateProps {
  functionInfo: ArmObj<FunctionInfo>;
}

export interface BindingUpdateInfo {
  newBindingInfo?: BindingInfo;
  currentBindingInfo?: BindingInfo;
  closedReason: 'cancel' | 'save' | 'delete';
}

export interface BindingEditorContextInfo {
  openEditor: (bindingDirection: BindingConfigDirection, bindingInfo?: BindingInfo) => Observable<BindingUpdateInfo>;
  closeEditor: () => void;
  updateFunctionInfo: React.Dispatch<React.SetStateAction<ArmObj<FunctionInfo>>>;
}

export const BindingEditorContext = React.createContext<BindingEditorContextInfo | null>(null);

export const FunctionIntegrate: React.SFC<FunctionIntegrateProps> = props => {
  const { functionInfo: initialFunctionInfo } = props;
  const theme = useContext(ThemeContext);

  const bindingUpdate$ = useRef(new Subject<BindingUpdateInfo>());
  const [bindingToUpdate, setBindingToUpdate] = useState<BindingInfo | undefined>(undefined);
  const [bindingDirection, setBindingDirection] = useState<BindingConfigDirection>(BindingConfigDirection.in);
  const [functionInfo, setFunctionInfo] = useState<ArmObj<FunctionInfo>>(initialFunctionInfo);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openEditor = (editorBindingDirection: BindingConfigDirection, bindingInfo?: BindingInfo): Observable<BindingUpdateInfo> => {
    setBindingDirection(editorBindingDirection);
    setBindingToUpdate(bindingInfo);
    setIsOpen(true);
    return bindingUpdate$.current;
  };

  const closeEditor = () => {
    setBindingToUpdate(undefined);
    setIsOpen(false);
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
    setIsOpen(false);
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
          bindingDirection={bindingDirection}
          onPanelClose={onCancel}
          onSubmit={onSubmit}
          isOpen={isOpen}
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
