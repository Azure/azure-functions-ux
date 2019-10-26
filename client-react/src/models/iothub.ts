export interface IotHub {
  cloudToDevice: CloudToDevice;
  enableFileUploadNotifications: boolean;
  eventHubEndpoints: EventHubEndpoints;
  features: string;
  hostName: string;
  ipFilterRules: string[];
  messagingEndpoints: MessagingEndpoints;
  operationsMonitoringProperties: OperationsMonitoringProperties;
  provisioningState: string;
  routing: Routing;
  state: string;
  storageEndpoints: StorageEndpoints;
}

export interface KeyList {
  value: Key[];
}

export interface Key {
  keyName: string;
  primaryKey: string;
  secondaryKey: string;
  rights: string;
}

export interface CloudToDevice {
  defaultTtlAsIso8601: string;
  feedback: Feedback;
  maxDeliveryCount: number;
}

export interface Feedback {
  lockDurationAsIso8601: string;
  maxDeliveryCount: number;
  ttlAsIso8601: string;
}

export interface EventHubEndpoints {
  events: EventHubEvents;
  operationsMonitoringEvents: EventHubEvents;
}

export interface EventHubEvents {
  endpoint: string;
  partitionCount: number;
  partitionIds: string[];
  path: string;
  retentionTimeInDays: number;
}

export interface MessagingEndpoints {
  fileNotifications: FileNotifications;
}

export interface FileNotifications {
  lockDurationAsIso8601: string;
  maxDeliveryCount: number;
  ttlAsIso8601: string;
}

export interface OperationsMonitoringProperties {
  events: OperationEvents;
}

export interface OperationEvents {
  C2DCommands: string;
  Connections: string;
  DeviceIdentityOperations: string;
  DeviceTelemetry: string;
  FileUploadOperations: string;
  None: string;
  Routes: string;
}

export interface Routing {
  endpoints: RoutingEndpoints;
  fallbackRoute: FallbackRoute;
  routes: string[];
}

export interface RoutingEndpoints {
  eventHubs: string[];
  serviceBusQueues: string[];
  serviceBusTops: string[];
}

export interface FallbackRoute {
  condition: string;
  endpointNames: string[];
  isEnabled: boolean;
  name: string;
  source: string;
}

export interface StorageEndpoints {
  $default: DefaultEndpoint;
}

export interface DefaultEndpoint {
  connectionString: string;
  containerName: string;
  sasTtlAsIso8601: string;
}
