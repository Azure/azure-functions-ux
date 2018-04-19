export interface ConnectionStrings {
    [key: string]: ConnectionString;
}

export interface ConnectionString {
    value: string;
    type: ConnectionStringType
}

export enum ConnectionStringType {
    MySql,
    SQLServer,
    SQLAzure,
    Custom,
    NotificationHub,
    ServiceBus,
    EventHub,
    ApiHub,
    DocDb,
    RedisCache,
    PostgreSQL
}