import { isFunctionApp, isLinuxApp, isContainerApp, isLinuxDynamic } from './arm-utils';

describe('isFunctionApp', () => {
  it('works with proper true kind', () => {
    const testVal = isFunctionApp({
      kind: 'app,functionapp',
    } as any);
    expect(testVal).toBe(true);
  });

  it('works with proper false kind', () => {
    const testVal = isFunctionApp({
      kind: 'app',
    } as any);
    expect(testVal).toBe(false);
  });

  it('works with proper null kind', () => {
    const testVal = isFunctionApp({
      kind: null,
    } as any);
    expect(testVal).toBe(false);
  });
});

describe('isLinuxApp', () => {
  it('works with proper true kind', () => {
    const testVal = isLinuxApp({
      kind: 'app,linux',
    } as any);
    expect(testVal).toBe(true);
  });

  it('works with proper false kind', () => {
    const testVal = isLinuxApp({
      kind: 'app',
    } as any);
    expect(testVal).toBe(false);
  });

  it('works with proper null kind', () => {
    const testVal = isLinuxApp({
      kind: null,
    } as any);
    expect(testVal).toBe(false);
  });
});

describe('isContainerApp', () => {
  it('works with proper true kind', () => {
    const testVal = isContainerApp({
      kind: 'app,container',
    } as any);
    expect(testVal).toBe(true);
  });

  it('works with proper false kind', () => {
    const testVal = isContainerApp({
      kind: 'app',
    } as any);
    expect(testVal).toBe(false);
  });

  it('works with proper null kind', () => {
    const testVal = isContainerApp({
      kind: null,
    } as any);
    expect(testVal).toBe(false);
  });
});

describe('isLinuxDynamic', () => {
  it('works with proper true kind and sku', () => {
    const testVal = isLinuxDynamic({
      kind: 'app,linux',
      properties: {
        sku: 'dynamic',
      },
    } as any);
    expect(testVal).toBe(true);
  });

  it('works with proper false kind but with sku', () => {
    const testVal = isLinuxDynamic({
      kind: 'app',
      properties: {
        sku: 'dynamic',
      },
    } as any);
    expect(testVal).toBe(false);
  });

  it('works with proper true kind but with differt sku', () => {
    const testVal = isLinuxDynamic({
      kind: 'app,linux',
      properties: {
        sku: 'standard',
      },
    } as any);
    expect(testVal).toBe(false);
  });
  it('works with proper null kind and sku', () => {
    const testVal = isLinuxDynamic({
      kind: null,
    } as any);
    expect(testVal).toBe(false);
  });
});
