export enum BroadcastEvent {
    FunctionDeleted,
    FunctionAdded,
    FunctionSelected,
    FunctionUpdated,
    // FunctionNew,
    UpdateBusyState,
    TutorialStep,
    IntegrateChanged,
    Error,
    VersionUpdated,
    TrialExpired,
    ResetKeySelection,
    RefreshPortal,
    ClearError,
    OpenTab,
    DirtyStateChange,
    AppsDashboard,
    AppDashboard,
    FunctionsDashboard,
    FunctionDashboard,
    FunctionIntegrateDashboard,
    FunctionManageDashboard,
    FunctionMonitorDashboard,
    CreateFunctionAutoDetectDashboard,
    CreateFunctionDashboard,
    CreateFunctionQuickstartDashboard,
    CreateProxyDashboard,
    ProxiesDashboard,
    ProxyDashboard,
    CreateSlotDashboard,
    SlotsDashboard,
    ReloadDeploymentCenter
}

export interface DirtyStateEvent {
    dirty: boolean;
    reason: string | null;
}

export interface BusyStateEvent{
    busyComponentName: string;
    action: 'setBusyState' | 'clearBusyState' | 'clearOverallBusyState';
    busyStateKey: string;
}