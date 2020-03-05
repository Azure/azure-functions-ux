import { IStackTokens, Stack } from 'office-ui-fabric-react';
import React, { useContext, useRef, useState } from 'react';
import { useWindowSize } from 'react-use';
import { Observable, Subject } from 'rxjs';
import { classes } from 'typestyle';
import EditModeBanner from '../../../../components/EditModeBanner/EditModeBanner';
import LoadingComponent from '../../../../components/Loading/LoadingComponent';
import { ReactComponent as DoubleArrow } from '../../../../images/Functions/double-arrow-left-right.svg';
import { ReactComponent as SingleArrow } from '../../../../images/Functions/single-arrow-left-right.svg';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding, BindingDirection } from '../../../../models/functions/binding';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { HostStatus } from '../../../../models/functions/host-status';
import { SiteStateContext } from '../../../../SiteStateContext';
import { ThemeContext } from '../../../../ThemeContext';
import SiteHelper from '../../../../utils/SiteHelper';
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
import FunctionIntegrateCommandBar from './FunctionIntegrateCommandBar';

export interface FunctionIntegrateProps {
  functionAppId: string;
  functionInfo: ArmObj<FunctionInfo>;
  bindings: Binding[];
  hostStatus: HostStatus;
  isRefreshing: boolean;
  refreshIntegrate: () => void;
}

export interface BindingUpdateInfo {
  closedReason: ClosedReason;
  currentBindingInfo?: BindingInfo;
  newBindingInfo?: BindingInfo;
}

export interface BindingEditorContextInfo {
  openEditor: (bindingDirection: BindingDirection, bindingInfo?: BindingInfo) => Observable<BindingUpdateInfo>;
  closeEditor: () => void;
  refreshIntegrate: () => void;
  setIsUpdating: (isUpdating: boolean) => void;
  updateFunctionInfo: React.Dispatch<React.SetStateAction<ArmObj<FunctionInfo>>>;
}

export const BindingEditorContext = React.createContext<BindingEditorContextInfo | null>(null);

export const FunctionIntegrate: React.FunctionComponent<FunctionIntegrateProps> = props => {
  const { functionAppId, functionInfo: initialFunctionInfo, bindings, hostStatus, isRefreshing, refreshIntegrate } = props;
  const siteState = useContext(SiteStateContext);
  const theme = useContext(ThemeContext);
  const { width } = useWindowSize();
  const fullPageWidth = 1000;

  const bindingUpdate$ = useRef(new Subject<BindingUpdateInfo>());
  const [bindingToUpdate, setBindingToUpdate] = useState<BindingInfo | undefined>(undefined);
  const [bindingDirection, setBindingDirection] = useState<BindingDirection>(BindingDirection.in);
  const [functionInfo, setFunctionInfo] = useState<ArmObj<FunctionInfo>>(initialFunctionInfo);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const onlyBuiltInBindings = !hostStatus.version.startsWith('1') && !hostStatus.extensionBundle;
  const readOnly = SiteHelper.isFunctionAppReadOnly(siteState.readOnlyState);

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
    refreshIntegrate,
    setIsUpdating,
    updateFunctionInfo: setFunctionInfo,
  };

  const tokens: IStackTokens = {
    childrenGap: 0,
  };

  const fullPageContent: JSX.Element = (
    <Stack className={diagramWrapperStyle} horizontal horizontalAlign={'center'} tokens={tokens}>
      <Stack.Item grow>
        <Stack gap={40}>
          <TriggerBindingCard functionInfo={functionInfo} bindings={bindings} readOnly={readOnly} />
          <InputBindingCard functionInfo={functionInfo} bindings={bindings} readOnly={readOnly} />
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
          <OutputBindingCard functionInfo={functionInfo} bindings={bindings} readOnly={readOnly} />
        </Stack>
      </Stack.Item>
    </Stack>
  );

  const smallPageContent: JSX.Element = (
    <Stack className={smallPageStyle} gap={40} horizontalAlign={'start'}>
      <TriggerBindingCard functionInfo={functionInfo} bindings={bindings} readOnly={readOnly} />
      <InputBindingCard functionInfo={functionInfo} bindings={bindings} readOnly={readOnly} />
      <FunctionNameBindingCard functionInfo={functionInfo} bindings={bindings} />
      <OutputBindingCard functionInfo={functionInfo} bindings={bindings} readOnly={readOnly} />
    </Stack>
  );

  return (
    <>
      {(isRefreshing || isUpdating) && <LoadingComponent overlay={true} />}
      <BindingEditorContext.Provider value={editorContext}>
        <EditModeBanner />
        <FunctionIntegrateCommandBar refreshIntegrate={refreshIntegrate} isRefreshing={isRefreshing} />
        <BindingPanel
          functionAppId={functionAppId}
          functionInfo={functionInfo}
          bindings={bindings}
          bindingInfo={bindingToUpdate}
          bindingDirection={bindingDirection}
          isOpen={isOpen}
          readOnly={readOnly}
          onlyBuiltInBindings={onlyBuiltInBindings}
          onPanelClose={onCancel}
          onSubmit={onSubmit}
          onDelete={onDelete}
        />
        {width > fullPageWidth ? fullPageContent : smallPageContent}
      </BindingEditorContext.Provider>
    </>
  );
};
