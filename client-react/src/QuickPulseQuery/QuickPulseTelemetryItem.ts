// tslint:disable: max-classes-per-file

export class QuickPulseCustomProperties {
  public QuickPulseId: string;
  public QuickPulseBuildVersion: string;
  public QuickPulseSourceBranch: string;
  public QuickPulseSourceVersion: string;
  public SdkVersion: string;
  public SdkInvariantVersion: string;
  public IsWebApp: boolean;
}

export class QuickPulseOptionalProperties {
  public IsWebApp: boolean;
}

export class QuickPulseErrorCustomProperties extends QuickPulseCustomProperties {
  public QuickPulseErrorType: string;
  public ErrorMessage: string;
}

export class QuickPulseCustomMetrics {
  public DurationSinceStart: number;
  public DependenciesReadySinceStart: number;
  public BaseInSeconds: number;
  public ReceivedSlots: number;
  public ReceivedRequests: number;
  public ReceivedRequestsDuration: number;
  public ReceivedRequestsFailed: number;
  public ReceivedDependencies: number;
  public ReceivedDependenciesDuration: number;
  public ReceivedDependenciesFailed: number;
  public ReceivedMemory: number;
  public ReceivedCPU: number;
  public ReceivedExceptions: number;
  public QuerySuccessCount: number;
  public TotalSuccessDurationInMs: number;
  public QueryFailedCount: number;
  public PartitionOverflownCount: number;
  public TotalFailedDurationInMs: number;
  public VisibilityState: number;
  public LiveFailuresExist: number;
  public QueryRequestsInFlight: number;
  public ClientWidth: number;
  public ClientHeight: number;
  public ScreenWidth: number;
  public ScreenHeight: number;
  public NumRows: number;
  public AnalyticsURL: string;
}

export class QuickPulseTelemetryItem {
  public Name: string;
  public Trace: string;
  public CustomProperties: QuickPulseCustomProperties;
  public CustomMetrics: QuickPulseCustomMetrics;
}

export class QuickPulseError {
  public IsError: boolean = true;
  public CustomProperties: QuickPulseErrorCustomProperties;
}
