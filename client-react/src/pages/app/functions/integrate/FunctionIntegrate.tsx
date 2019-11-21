import { IStackTokens, Stack } from 'office-ui-fabric-react';
import React, { useContext, useRef, useState } from 'react';
import { Observable, Subject } from 'rxjs';
import { classes } from 'typestyle';
import { ReactComponent as DoubleArrow } from '../../../../images/Functions/double-arrow-left-right.svg';
import { ReactComponent as SingleArrow } from '../../../../images/Functions/single-arrow-left-right.svg';
import { ArmObj } from '../../../../models/arm-obj';
import { BindingConfigDirection, BindingsConfig } from '../../../../models/functions/bindings-config';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { ThemeContext } from '../../../../ThemeContext';
import { ClosedReason } from './BindingPanel/BindingEditor';
import BindingPanel from './BindingPanel/BindingPanel';
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
  smallPageStyle,
} from './FunctionIntegrate.style';
import { useWindowSize } from 'react-use';

export interface FunctionIntegrateProps {
  functionInfo: ArmObj<FunctionInfo>;
  bindingsConfig: BindingsConfig;
}

export interface BindingUpdateInfo {
  newBindingInfo?: BindingInfo;
  currentBindingInfo?: BindingInfo;
  closedReason: ClosedReason;
}

export interface BindingEditorContextInfo {
  openEditor: (bindingDirection: BindingConfigDirection, bindingInfo?: BindingInfo) => Observable<BindingUpdateInfo>;
  closeEditor: () => void;
  updateFunctionInfo: React.Dispatch<React.SetStateAction<ArmObj<FunctionInfo>>>;
}

export const BindingEditorContext = React.createContext<BindingEditorContextInfo | null>(null);

export const FunctionIntegrate: React.FunctionComponent<FunctionIntegrateProps> = props => {
  const { functionInfo: initialFunctionInfo, bindingsConfig } = props;
  const theme = useContext(ThemeContext);
  const { width } = useWindowSize();
  const fullPageWidth = 1000;

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
    setIsOpen(false);
    setBindingToUpdate(undefined);
  };

  const onSubmit = (newBindingInfo: BindingInfo, currentBindingInfo?: BindingInfo) => {
    bindingUpdate$.current.next({
      newBindingInfo,
      currentBindingInfo,
      closedReason: ClosedReason.Save,
    });
  };

  const onCancel = () => {
    bindingUpdate$.current.next({
      currentBindingInfo: bindingToUpdate,
      closedReason: ClosedReason.Cancel,
    });

    setIsOpen(false);
    setBindingToUpdate(undefined);
  };

  const onDelete = (currentBindingInfo: BindingInfo) => {
    bindingUpdate$.current.next({
      currentBindingInfo,
      closedReason: ClosedReason.Delete,
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

  const fullPageContent: JSX.Element = (
    <Stack className={diagramWrapperStyle} horizontal horizontalAlign={'center'} tokens={tokens}>
      <Stack.Item grow>
        <Stack gap={40}>
          <TriggerBindingCard functionInfo={functionInfo} bindingsConfig={bindingsConfig} />
          <InputBindingCard functionInfo={functionInfo} bindingsConfig={bindingsConfig} />
        </Stack>
      </Stack.Item>

      <Stack.Item grow>
        <DoubleArrow className={classes(defaultArrowStyle(theme), doubleArrowStyle)} {...arrowProps} />
      </Stack.Item>

      <Stack.Item grow>
        <Stack verticalFill={true} className={singleCardStackStyle}>
          <FunctionNameBindingCard functionInfo={functionInfo} bindingsConfig={bindingsConfig} />
        </Stack>
      </Stack.Item>

      <Stack.Item grow>
        <SingleArrow className={classes(defaultArrowStyle(theme), singleArrowStyle)} {...arrowProps} />
      </Stack.Item>

      <Stack.Item grow>
        <Stack verticalFill={true} className={singleCardStackStyle}>
          <OutputBindingCard functionInfo={functionInfo} bindingsConfig={bindingsConfig} />
        </Stack>
      </Stack.Item>
    </Stack>
  );

  const smallPageContent: JSX.Element = (
    <Stack className={smallPageStyle} gap={40} horizontalAlign={'start'}>
      <TriggerBindingCard functionInfo={functionInfo} bindingsConfig={bindingsConfig} />
      <InputBindingCard functionInfo={functionInfo} bindingsConfig={bindingsConfig} />
      <FunctionNameBindingCard functionInfo={functionInfo} bindingsConfig={bindingsConfig} />
      <OutputBindingCard functionInfo={functionInfo} bindingsConfig={bindingsConfig} />
    </Stack>
  );

  return (
    <>
      <BindingEditorContext.Provider value={editorContext}>
        <BindingPanel
          functionInfo={functionInfo}
          functionAppId={functionAppId}
          bindingsConfig={bindingsConfig}
          bindingInfo={bindingToUpdate}
          bindingDirection={bindingDirection}
          onPanelClose={onCancel}
          onSubmit={onSubmit}
          onDelete={onDelete}
          isOpen={isOpen}
        />

        {width > fullPageWidth ? fullPageContent : smallPageContent}
      </BindingEditorContext.Provider>
    </>
  );
};
