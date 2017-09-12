export enum BroadcastEvent {
    FunctionDeleted,
    FunctionAdded,
    FunctionSelected,
    FunctionUpdated,
    // FunctionNew,
    BusyState,
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
}

export interface DirtyStateEvent {
    dirty: boolean;
    reason: string | null;
}