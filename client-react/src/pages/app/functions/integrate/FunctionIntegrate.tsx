import { IStackTokens, Stack } from 'office-ui-fabric-react';
import React, { useContext, useRef, useState } from 'react';
import { Observable, Subject } from 'rxjs';
import { classes } from 'typestyle';
import { ReactComponent as DoubleArrow } from '../../../../images/Functions/double-arrow-left-right.svg';
import { ReactComponent as SingleArrow } from '../../../../images/Functions/single-arrow-left-right.svg';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding, BindingDirection } from '../../../../models/functions/binding';
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
import EditModeBanner from '../../../../components/EditModeBanner/EditModeBanner';

export interface FunctionIntegrateProps {
  functionInfo: ArmObj<FunctionInfo>;
  bindings: Binding[];
  // setRequiredBindingId: pass in the id of a binding for which more information is required
  // Data Loader will then do an additional request to retrieve that binding's complete info
  setRequiredBindingId: (id: string) => void;
}

export interface BindingUpdateInfo {
  newBindingInfo?: BindingInfo;
  currentBindingInfo?: BindingInfo;
  closedReason: ClosedReason;
}

export interface BindingEditorContextInfo {
  openEditor: (bindingDirection: BindingDirection, bindingInfo?: BindingInfo) => Observable<BindingUpdateInfo>;
  closeEditor: () => void;
  updateFunctionInfo: React.Dispatch<React.SetStateAction<ArmObj<FunctionInfo>>>;
}

export const BindingEditorContext = React.createContext<BindingEditorContextInfo | null>(null);

export const FunctionIntegrate: React.FunctionComponent<FunctionIntegrateProps> = props => {
  const { functionInfo: initialFunctionInfo, bindings, setRequiredBindingId } = props;
  const theme = useContext(ThemeContext);
  const { width } = useWindowSize();
  const fullPageWidth = 1000;

  const bindingUpdate$ = useRef(new Subject<BindingUpdateInfo>());
  const [bindingToUpdate, setBindingToUpdate] = useState<BindingInfo | undefined>(undefined);
  const [bindingDirection, setBindingDirection] = useState<BindingDirection>(BindingDirection.in);
  const [functionInfo, setFunctionInfo] = useState<ArmObj<FunctionInfo>>(initialFunctionInfo);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const openEditor = (editorBindingDirection: BindingDirection, bindingInfo?: BindingInfo): Observable<BindingUpdateInfo> => {
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
          <TriggerBindingCard functionInfo={functionInfo} bindings={bindings} setRequiredBindingId={setRequiredBindingId} />
          <InputBindingCard functionInfo={functionInfo} bindings={bindings} setRequiredBindingId={setRequiredBindingId} />
        </Stack>
      </Stack.Item>

      <Stack.Item grow>
        <DoubleArrow className={classes(defaultArrowStyle(theme), doubleArrowStyle)} {...arrowProps} />
      </Stack.Item>

      <Stack.Item grow>
        <Stack verticalFill={true} className={singleCardStackStyle}>
          <FunctionNameBindingCard functionInfo={functionInfo} bindings={bindings} />
        </Stack>
      </Stack.Item>

      <Stack.Item grow>
        <SingleArrow className={classes(defaultArrowStyle(theme), singleArrowStyle)} {...arrowProps} />
      </Stack.Item>

      <Stack.Item grow>
        <Stack verticalFill={true} className={singleCardStackStyle}>
          <OutputBindingCard functionInfo={functionInfo} bindings={bindings} setRequiredBindingId={setRequiredBindingId} />
        </Stack>
      </Stack.Item>
    </Stack>
  );

  const smallPageContent: JSX.Element = (
    <Stack className={smallPageStyle} gap={40} horizontalAlign={'start'}>
      <TriggerBindingCard functionInfo={functionInfo} bindings={bindings} setRequiredBindingId={setRequiredBindingId} />
      <InputBindingCard functionInfo={functionInfo} bindings={bindings} setRequiredBindingId={setRequiredBindingId} />
      <FunctionNameBindingCard functionInfo={functionInfo} bindings={bindings} />
      <OutputBindingCard functionInfo={functionInfo} bindings={bindings} setRequiredBindingId={setRequiredBindingId} />
    </Stack>
  );

  return (
    <>
      <BindingEditorContext.Provider value={editorContext}>
        <EditModeBanner />
        <BindingPanel
          functionInfo={functionInfo}
          functionAppId={functionAppId}
          bindings={bindings}
          bindingInfo={bindingToUpdate}
          bindingDirection={bindingDirection}
          onPanelClose={onCancel}
          onSubmit={onSubmit}
          onDelete={onDelete}
          isOpen={isOpen}
          setRequiredBindingId={setRequiredBindingId}
        />

        {width > fullPageWidth ? fullPageContent : smallPageContent}
      </BindingEditorContext.Provider>
    </>
  );
};
