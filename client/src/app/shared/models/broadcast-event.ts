export enum BroadcastEvent {
    TreeNavigation,
    TreeUpdate,
    FunctionDeleted,
    FunctionAdded,
    FunctionSelected,
    FunctionUpdated,
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
    ReloadDeploymentCenter,
    UpdateAppsList,
    FunctionEditorEvent,
    RightTabsEvent,
    BottomTabsEvent,
    RefreshMonitoringView,
    FunctionCodeUpdate,
    FunctionRunEvent
}

export interface DirtyStateEvent {
    dirty: boolean;
    reason: string | null;
}

export interface BusyStateEvent {
    busyComponentName: string;
    action: 'setBusyState' | 'clearBusyState' | 'clearOverallBusyState';
    busyStateKey: string;
}

export interface TreeUpdateEvent {
    operation: 'add' | 'remove' | 'removeChild' | 'update' | 'navigate';
    resourceId: string;
    data?: any;
}
