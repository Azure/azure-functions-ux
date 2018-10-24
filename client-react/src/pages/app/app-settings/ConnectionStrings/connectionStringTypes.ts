export enum DatabaseType {
  MySql = 0,
  SQLServer = 1,
  SQLAzure = 2,
  Custom = 3,
  NotificationHub = 4,
  ServiceBus = 5,
  EventHub = 6,
  ApiHub = 7,
  DocDb = 8,
  RedisCache = 9,
  PostgreSQL = 10,
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
