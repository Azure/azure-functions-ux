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

// Only the following connection string types are actually supported: MySql, SQLServer, SQLAzure, Custom
// The remaing types are not valid but were inadvertently exposed in the portal for several months.
// THE INVALID TYPES ARE ONLY TO BE USED/DISPLAYED IN CASES WHERE THEY ARE PRESENT IN EXISTING CONFIGURATION.
export namespace ConnectionStringType {
    export function isSupported(type: ConnectionStringType) {
        switch (type) {
            case ConnectionStringType.MySql:
            case ConnectionStringType.SQLServer:
            case ConnectionStringType.SQLAzure:
            case ConnectionStringType.Custom:
                return true;
            default:
                return false;
        }
    }
}