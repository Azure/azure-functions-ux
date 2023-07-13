import { IStackTokens, MessageBarType, Stack } from '@fluentui/react';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from 'react-use';
import { Observable, Subject } from 'rxjs';
import { classes } from 'typestyle';
import { PortalContext } from '../../../../../PortalContext';
import { SiteStateContext } from '../../../../../SiteState';
import { ThemeContext } from '../../../../../ThemeContext';
import CustomBanner from '../../../../../components/CustomBanner/CustomBanner';
import EditModeBanner from '../../../../../components/EditModeBanner/EditModeBanner';
import LoadingComponent from '../../../../../components/Loading/LoadingComponent';
import { ReactComponent as DoubleArrow } from '../../../../../images/Functions/double-arrow-left-right.svg';
import { ReactComponent as SingleArrow } from '../../../../../images/Functions/single-arrow-left-right.svg';
import { ArmObj } from '../../../../../models/arm-obj';
import { Binding, BindingDirection } from '../../../../../models/functions/binding';
import { BindingInfo } from '../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { HostStatus } from '../../../../../models/functions/host-status';
import { Links } from '../../../../../utils/FwLinks';
import SiteHelper from '../../../../../utils/SiteHelper';
import StringUtils from '../../../../../utils/string';
import { isNewNodeProgrammingModel, isNewPythonProgrammingModel } from '../function-editor/useFunctionEditorQueries';
import { ClosedReason } from './BindingPanel/BindingEditor';
import BindingPanel from './BindingPanel/BindingPanel';
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
import { FunctionIntegrateConstants } from './FunctionIntegrateConstants';
import FunctionNameBindingCard from './binding-card/FunctionNameBindingCard';
import InputBindingCard from './binding-card/InputBindingCard';
import OutputBindingCard from './binding-card/OutputBindingCard';
import TriggerBindingCard from './binding-card/TriggerBindingCard';
import UnknownDirectionBindingCard from './binding-card/UnknownDirectionBindingCard';

export interface FunctionIntegrateProps {
  functionAppId: string;
  functionInfo: ArmObj<FunctionInfo> | null;
  bindings: Binding[];
  bindingsError: boolean;
  hostStatus: HostStatus;
  isRefreshing: boolean;
  refreshIntegrate: () => void;
  loadBindingSettings: (bindingId: string, force: boolean) => Promise<void>;
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
  const {
    functionAppId,
    functionInfo: initialFunctionInfo,
    bindings,
    bindingsError,
    hostStatus,
    isRefreshing,
    refreshIntegrate,
    loadBindingSettings,
  } = props;
  const { t } = useTranslation();
  const portalCommunicator = useContext(PortalContext);
  const siteStateContext = useContext(SiteStateContext);
  const theme = useContext(ThemeContext);
  const { width } = useWindowSize();
  const fullPageWidth = 1000;

  const bindingUpdate$ = useRef(new Subject<BindingUpdateInfo>());
  const [bindingToUpdate, setBindingToUpdate] = useState<BindingInfo | undefined>(undefined);
  const [bindingDirection, setBindingDirection] = useState<BindingDirection>(BindingDirection.in);
  const [functionInfo, setFunctionInfo] = useState<ArmObj<FunctionInfo> | null>(initialFunctionInfo);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const onlyBuiltInBindings = !hostStatus.version.startsWith('1') && !hostStatus.extensionBundle;
  const bindingsReadOnly = useMemo(
    () => !!functionInfo && (isNewNodeProgrammingModel(functionInfo) || isNewPythonProgrammingModel(functionInfo)),
    [functionInfo]
  );
  const functionAppReadOnly = useMemo(() => SiteHelper.isFunctionAppReadOnly(siteStateContext.siteAppEditState), [
    siteStateContext.siteAppEditState,
  ]);
  const readOnly = functionAppReadOnly || bindingsReadOnly;

  const openEditor = (editorBindingDirection: BindingDirection, bindingInfo?: BindingInfo): Observable<BindingUpdateInfo> => {
    setBindingDirection(editorBindingDirection);
    setBindingToUpdate(bindingInfo);
    setIsOpen(true);
    return bindingUpdate$.current;
  };

  const closeEditor = () => {
    setIsOpen(false);
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
  };

  const onDelete = (currentBindingInfo: BindingInfo) => {
    bindingUpdate$.current.next({
      currentBindingInfo,
      closedReason: ClosedReason.Delete,
    });

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

  const fullPageContent: JSX.Element | null = functionInfo ? (
    <Stack className={diagramWrapperStyle} horizontal horizontalAlign={'center'} tokens={tokens}>
      <Stack.Item grow>
        <Stack gap={40}>
          <TriggerBindingCard
            functionInfo={functionInfo}
            bindings={bindings}
            readOnly={readOnly}
            loadBindingSettings={loadBindingSettings}
          />
          <InputBindingCard functionInfo={functionInfo} bindings={bindings} readOnly={readOnly} loadBindingSettings={loadBindingSettings} />
        </Stack>
      </Stack.Item>

      <Stack.Item grow>
        <DoubleArrow className={classes(defaultArrowStyle(theme), doubleArrowStyle)} {...arrowProps} />
      </Stack.Item>

      <Stack.Item grow>
        <Stack gap={40} verticalFill={true} className={singleCardStackStyle}>
          <FunctionNameBindingCard functionInfo={functionInfo} bindings={bindings} />
          <UnknownDirectionBindingCard functionInfo={functionInfo} bindings={bindings} />
        </Stack>
      </Stack.Item>

      <Stack.Item grow>
        <SingleArrow className={classes(defaultArrowStyle(theme), singleArrowStyle)} {...arrowProps} />
      </Stack.Item>

      <Stack.Item grow>
        <Stack verticalFill={true} className={singleCardStackStyle}>
          <OutputBindingCard
            functionInfo={functionInfo}
            bindings={bindings}
            readOnly={readOnly}
            loadBindingSettings={loadBindingSettings}
          />
        </Stack>
      </Stack.Item>
    </Stack>
  ) : null;

  const smallPageContent: JSX.Element | null = functionInfo ? (
    <Stack className={smallPageStyle} gap={40} horizontalAlign={'start'}>
      <TriggerBindingCard functionInfo={functionInfo} bindings={bindings} readOnly={readOnly} loadBindingSettings={loadBindingSettings} />
      <InputBindingCard functionInfo={functionInfo} bindings={bindings} readOnly={readOnly} loadBindingSettings={loadBindingSettings} />
      <FunctionNameBindingCard functionInfo={functionInfo} bindings={bindings} />
      <OutputBindingCard functionInfo={functionInfo} bindings={bindings} readOnly={readOnly} loadBindingSettings={loadBindingSettings} />
      <UnknownDirectionBindingCard functionInfo={functionInfo} bindings={bindings} />
    </Stack>
  ) : null;

  const functionConfig = functionInfo?.properties.config;

  const isCompiledFunction =
    functionConfig === undefined
      ? undefined
      : StringUtils.equalsIgnoreCase(functionConfig.configurationSource, FunctionIntegrateConstants.compiledFunctionConfigurationSource);

  const bindingsMissingDirection = functionConfig?.bindings.filter(
    binding => !binding.direction && !StringUtils.endsWithIgnoreCase(binding.type.toString(), 'Trigger')
  );

  const onFunctionInfoErrorClick = useCallback(() => {
    portalCommunicator.openBlade({
      detailBlade: 'FunctionDownloadContentTemplateBlade',
      detailBladeInputs: {
        id: functionAppId,
      },
      extension: 'WebsitesExtension',
      openAsContextBlade: true,
    });
  }, [functionAppId, portalCommunicator]);

  let banner: JSX.Element | undefined;
  if (bindingsError) {
    // Issue loading bindings or binding settings
    banner = <CustomBanner message={t('integrate_bindingsFailedLoading')} type={MessageBarType.error} />;
  } else if (!functionInfo) {
    // Issue loading function info
    banner = <CustomBanner message={t('functionInfoUnavailableError')} type={MessageBarType.error} onClick={onFunctionInfoErrorClick} />;
  } else if (isCompiledFunction && bindingsMissingDirection && bindingsMissingDirection.length === 0) {
    // It's a C# compiled function, and older versions of the SDK don't show input/out bindings.
    banner = <CustomBanner message={t('integrate_compiledDoNotShowInputOutput')} type={MessageBarType.info} />;
  } else if (bindingsMissingDirection && bindingsMissingDirection.length > 0) {
    // Bindings are missing the direction property, we'll likely put them in the wrong spot
    banner = (
      <CustomBanner
        message={t('integrate_bindingsMissingDirection').format(bindingsMissingDirection.map(binding => binding.name).join(', '))}
        type={MessageBarType.warning}
        learnMoreLink={Links.bindingDirectionLearnMore}
      />
    );
  } else if (bindingsReadOnly && !functionAppReadOnly) {
    // Bindings are read-only for v2 Python and v4 Node.js progrmaming model functions, which are otherwise read-write.
    banner = <CustomBanner message={t('integrate_readOnlyNewProgrammingModel')} type={MessageBarType.info} />;
  } else if (readOnly) {
    // All readonly situations
    banner = <EditModeBanner />;
  }

  return (
    <>
      {(isRefreshing || isUpdating) && <LoadingComponent overlay={true} />}
      <BindingEditorContext.Provider value={editorContext}>
        <FunctionIntegrateCommandBar refreshIntegrate={refreshIntegrate} isRefreshing={isRefreshing} />
        {banner}
        <div className={smallPageStyle}>
          <h3>{t('integratePageTitle')}</h3>
          <div>{t('integratePageDescription')}</div>
        </div>
        {functionInfo ? (
          <>
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
          </>
        ) : null}
      </BindingEditorContext.Provider>
    </>
  );
};
