import { typeValueToString, DatabaseType } from './connectionStringTypes';

describe('Types map correctly to strings', () => {
  it('MySql', () => {
    expect(typeValueToString(DatabaseType.MySql)).toBe('MySQL');
  });

  it('SQLServer', () => {
    expect(typeValueToString(DatabaseType.SQLServer)).toBe('SQLServer');
  });

  it('SQLAzure', () => {
    expect(typeValueToString(DatabaseType.SQLAzure)).toBe('SQLAzure');
  });

  it('Custom', () => {
    expect(typeValueToString(DatabaseType.Custom)).toBe('Custom');
  });

  it('NotificationHub', () => {
    expect(typeValueToString(DatabaseType.NotificationHub)).toBe('Notification Hub');
  });

  it('ServiceBus', () => {
    expect(typeValueToString(DatabaseType.ServiceBus)).toBe('Service Bus');
  });

  it('EventHub', () => {
    expect(typeValueToString(DatabaseType.EventHub)).toBe('Event Hub');
  });

  it('ApiHub', () => {
    expect(typeValueToString(DatabaseType.ApiHub)).toBe('Api Hub');
  });

  it('DocDb', () => {
    expect(typeValueToString(DatabaseType.DocDb)).toBe('Document Db');
  });

  it('RedisCache', () => {
    expect(typeValueToString(DatabaseType.RedisCache)).toBe('Redis Cache');
  });

  it('PostgreSQL', () => {
    expect(typeValueToString(DatabaseType.PostgreSQL)).toBe('PostgreSQL');
  });
});
