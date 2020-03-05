// tslint:disable: max-classes-per-file

export enum QPSchemaMetricEnum {
  ContributorsCount = 'ContributorsCount',
  Requests = '\\ApplicationInsights\\Requests/Sec',
  RequestDuration = '\\ApplicationInsights\\Request Duration',
  RequestsFailed = '\\ApplicationInsights\\Requests Failed/Sec',
  Dependencies = '\\ApplicationInsights\\Dependency Calls/Sec',
  DependencyDuration = '\\ApplicationInsights\\Dependency Call Duration',
  DependenciesFailed = '\\ApplicationInsights\\Dependency Calls Failed/Sec',
  Memory = '\\Memory\\Committed Bytes',
  CPU = '\\Processor(_Total)\\% Processor Time',
  Exceptions = '\\ApplicationInsights\\Exceptions/Sec',
  DerivedMetric = 'DerivedMetric',
}

export enum TelemetryTypesEnum {
  Request = 'Request',
  Dependency = 'Dependency',
  Exception = 'Exception',
  Event = 'Event',
  Trace = 'Trace',
  Metric = 'Metric',
  PerformanceCounter = 'PerformanceCounter',
}

export enum AggregationTypesEnum {
  Sum = 'Sum',
  Avg = 'Avg',
  Min = 'Min',
  Max = 'Max',
}

export enum RequestFieldsEnum {
  Url = 'Url',
  Duration = 'Duration',
  Success = 'Success',
  ResponseCode = 'ResponseCode',
  Name = 'Name',
  CustomDimension = 'Custom Dimension',
  CustomMeasurement = 'Custom Measurement',
}

export enum DependencyFieldsEnum {
  Duration = 'Duration',
  Success = 'Success',
  Type = 'Type',
  Target = 'Target',
  Data = 'Data',
  Name = 'Name',
  ResultCode = 'ResultCode',
  CustomDimension = 'Custom Dimension',
  CustomMeasurement = 'Custom Measurement',
}

export enum ExceptionFieldsEnum {
  Message = 'Exception.Message',
  StackTrace = 'Exception.StackTrace',
  CustomDimension = 'Custom Dimension',
  CustomMeasurement = 'Custom Measurement',
}

export enum EventFieldsEnum {
  Name = 'Name',
  CustomDimension = 'Custom Dimension',
  CustomMeasurement = 'Custom Measurement',
}

export enum MetricFieldsEnum {
  MetricName = 'MetricName',
  Value = 'Value',
  CustomDimension = 'Custom Dimension',
}

export enum TraceFieldsEnum {
  Message = 'Message',
  CustomDimension = 'Custom Dimension',
}

export enum OperationsEnum {
  Equal = 'Equal',
  NotEqual = 'NotEqual',
  GreaterThan = 'GreaterThan',
  LessThan = 'LessThan',
  GreaterThanOrEqual = 'GreaterThanOrEqual',
  LessThanOrEqual = 'LessThanOrEqual',
  Contains = 'Contains',
  DoesNotContain = 'DoesNotContain',
}

export class QPMetricGroupDefinition {
  public GroupName: string;
  public MetricDefinitions: QPMetricDefinition[];
}

export enum QPChartType {
  Line,
  Scatter,
}

export class QPMetricDefinition {
  public FriendlyName: string;
  public MetricType: QPSchemaMetricEnum;
  public CustomMetricId: string;
  public Configuration: QPSchemaConfigurationMetric;
  public DraftMetricId: string;
  public Color: string;
  public ChartType: QPChartType;
}

export class SchemaDocumentContent {
  public DocumentType?: string;
  public DependencyKind?: string;
  public HttpMethod?: string;
  public Url?: string;
  public Target?: string;
  public CommandName?: string;
  public Name?: string;
  public ResponseCode?: string;
  public ResultCode?: string;
  public Success?: boolean;
  public Duration?: number;
  public Exception?: string;
  public Message?: string;
  public ExceptionType?: string;
  public ExceptionMessage?: string;
  public SeverityLevel?: string;
  public Properties?: QPSchemaProperty[];
  public OperationName?: string;
}

export class QPSchemaProperty {
  public key: string;
  public value: string;
}

export class SchemaDocument {
  public SequenceNumber: number;
  public DocumentStreamIds?: string[];
  public Content: SchemaDocumentContent;
  public Instance?: string;
  public Timestamp: string;
  public ExceptionType?: string;
  public UniqueKey?: string;
}

export class QuickPulseMetric {
  public Name: string;
  public Values: number[];
}

export class QPSchemaStreamData {
  public Timestamp: string;
  public AgentVersion: string;
  public AggregatorId: string;
  public Instance: string;
  public AgentInvariantVersion: number;
  public AgentIsWebApp: boolean;
  public PerformanceCollectionSupported: boolean;
  public Documents: SchemaDocument[];
  public Metrics: QuickPulseMetric[];
  public TopCpuProcesses: QPSSchemaTopProcess[];
}

export class QPSchemaAgentInfo {
  public IsAuthorized: boolean;
  public StreamId: string;
  public Version: string;
  public InvariantVersion: number;
}

export class QPSchemaServer {
  public FriendlyName: string;
  public Id: string;
  public Agents: QPSchemaAgentInfo[];
}

export class QPSchemaServersInfo {
  public MetricAverageValues: number[][];
  public MetricNames: string[];
  public Servers: QPSchemaServer[];
}

export class QPSchemaActivityInfo {
  public ActiveServersCount: number;
  public KnownActivity: boolean;
}

export class SchemaResponseV2 {
  public DataRanges: QPSchemaStreamData[];
  public ServersInfo: QPSchemaServersInfo;
  public ActivityInfo: QPSchemaActivityInfo;
  // TODO: add schema here
  public ConfigurationErrors: any[];
  public SdkAuthOnboardPeriodExpiration: string;
  public PartitionOverflown: boolean;
}

export class QPSSchemaTopProcess {
  public ProcessName: string;
  public CpuPercentage: number;
}

export class QPSchemaConfigurationSession {
  public Id: string;
  public Version: number;
  public Metrics: QPSchemaConfigurationMetric[];
  public DocumentStreams: QPSchemaDocumentStreamInfo[];
  public TrustedUnauthorizedAgents: string[];
}

export class QPSchemaConfigurationMetric {
  public Id: string;
  public TelemetryType: TelemetryTypesEnum;
  public FilterGroups: QPSchemaFilterConjunctionGroupInfo[];
  public Projection: string;
  public Aggregation: string;
  public BackEndAggregation: string;
}

export class QPSchemaFilterConjunctionGroupInfo {
  public Filters: QPSchemaConfigurationFilter[];
}

/**
 * FieldName is the filter ID.
 * Predicate is the inequality operator itself (less than, greater than, etc).
 * Comparand is the value which is used by the predicate to compare with.
 **/
export class QPSchemaConfigurationFilter {
  public FieldName: string;
  public Predicate: string;
  public Comparand: string;
}

export class QPSchemaDocumentFilterConjunctionGroupInfo {
  public TelemetryType: TelemetryTypesEnum;
  public Filters: QPSchemaFilterConjunctionGroupInfo;
}

export class QPSchemaDocumentStreamInfo {
  public Id: string;
  public DocumentFilterGroups: QPSchemaDocumentFilterConjunctionGroupInfo[];
}

export type PageIdReferenceEnum = 'tabPageAppHealth' | 'tabPageExplorer';
export const PageIdReferenceEnum = {
  LiveOverviewPage: 'tabPageAppHealth' as PageIdReferenceEnum,
  LiveDiagnosticsPage: 'tabPageExplorer' as PageIdReferenceEnum,
};
