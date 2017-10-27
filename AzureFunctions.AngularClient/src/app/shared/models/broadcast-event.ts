export enum BroadcastEvent {
    TreeNavigation,
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
    DirtyStateChange
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