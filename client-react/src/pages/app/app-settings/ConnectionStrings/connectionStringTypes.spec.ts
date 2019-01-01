import { typeValueToString, DatabaseType } from './connectionStringTypes';

describe('Types map correctly to strings', () => {
  it('MySql', () => {
    expect(typeValueToString(0)).toBe('MySQL');
  });

  it('SQLServer', () => {
    expect(typeValueToString(1)).toBe('SQLServer');
  });

  it('SQLAzure', () => {
    expect(typeValueToString(2)).toBe('SQLAzure');
  });

  it('Custom', () => {
    expect(typeValueToString(3)).toBe('Custom');
  });

  it('NotificationHub', () => {
    expect(typeValueToString(4)).toBe('Notification Hub');
  });

  it('ServiceBus', () => {
    expect(typeValueToString(5)).toBe('Service Bus');
  });

  it('EventHub', () => {
    expect(typeValueToString(6)).toBe('Event Hub');
  });

  it('ApiHub', () => {
    expect(typeValueToString(7)).toBe('Api Hub');
  });

  it('DocDb', () => {
    expect(typeValueToString(8)).toBe('Document Db');
  });

  it('RedisCache', () => {
    expect(typeValueToString(9)).toBe('Redis Cache');
  });

  it('PostgreSQL', () => {
    expect(typeValueToString(10)).toBe('PostgreSQL');
  });

  it('Other', () => {
    expect(typeValueToString(132)).toBe('Other');
    expect(typeValueToString(34)).toBe('Other');
  });
});
