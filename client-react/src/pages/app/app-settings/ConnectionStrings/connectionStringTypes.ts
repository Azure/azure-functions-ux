export enum DatabaseType {
  MySql = 'MySql',
  SQLServer = 'SQLServer',
  SQLAzure = 'SQLAzure',
  Custom = 'Custom',
  NotificationHub = 'NotificationHub',
  ServiceBus = 'ServiceBus',
  EventHub = 'EventHub',
  ApiHub = 'ApiHub',
  DocDb = 'DocDb',
  RedisCache = 'RedisCache',
  PostgreSQL = 'PostgreSQL',
}

export function typeValueToString(val: DatabaseType) {
  switch (val) {
    case DatabaseType.MySql:
      return 'MySQL';
    case DatabaseType.SQLServer:
      return 'SQLServer';
    case DatabaseType.SQLAzure:
      return 'SQLAzure';
    case DatabaseType.PostgreSQL:
      return 'PostgreSQL';
    case DatabaseType.Custom:
      return 'Custom';
    case DatabaseType.NotificationHub:
      return 'Notification Hub';
    case DatabaseType.ServiceBus:
      return 'Service Bus';
    case DatabaseType.EventHub:
      return 'Event Hub';
    case DatabaseType.ApiHub:
      return 'Api Hub';
    case DatabaseType.DocDb:
      return 'Document Db';
    case DatabaseType.RedisCache:
      return 'Redis Cache';
    default:
      return 'Other';
  }
}
