import MockCall from './ArmHelper';

describe('Arm Helper', () => {
  beforeEach(() => {
    (fetch as any).resetMocks();
  });
  it('returns data from fetch in buffer path', async () => {
    (fetch as any).mockResponseOnce(JSON.stringify({ responses: [{ httpStatusCode: 200, content: { val: 'test' } }] }));
    const t = await MockCall<any>('test', 'test', 'test', 'test');
    expect(t.val).toBe('test');
  });

  it('returns data from fetch in non buffer path', async () => {
    (fetch as any).mockResponseOnce(JSON.stringify({ val: 'test' }));
    const t = await MockCall<any>('test', 'test', 'test', 'test', 'GET', undefined, true);
    expect(t.val).toBe('test');
  });

  it('returns data from fetch in non buffer path', async () => {
    (fetch as any).mockResponseOnce(JSON.stringify({ val: 'test' }));
    const t = await MockCall<any>('test', 'test', 'test', 'test', 'GET', undefined, true);
    expect(t.val).toBe('test');
  });

  it('Batched call should only happen once for multiple burst calls', async () => {
    (fetch as any).mockResponseOnce(
      JSON.stringify({
        responses: [{ httpStatusCode: 200, content: { val: 'test1' } }, { httpStatusCode: 200, content: { val: 'test2' } }],
      })
    );

    const t = MockCall<any>('test', 'test', 'test', 'test');
    const r = MockCall<any>('test', 'test', 'test2', 'test2');
    const [tR, rR] = await Promise.all([t, r]);
    expect(tR.val).toBe('test1');
    expect(rR.val).toBe('test2');
    expect((fetch as any).mock.calls.length).toEqual(1);
  });

  it('Should throw error when non 200 call is made only on error call', async () => {
    (fetch as any).mockResponseOnce(
      JSON.stringify({
        responses: [{ httpStatusCode: 200, content: { val: 'test1' } }, { httpStatusCode: 401, content: { val: 'test2' } }],
      })
    );
    const rCatchFn = jest.fn();
    const tCatchFn = jest.fn();
    const t = MockCall<any>('test', 'test', 'test', 'test').catch(tCatchFn);
    const r = MockCall<any>('test', 'test', 'test2', 'test2').catch(rCatchFn);
    await t;
    await r;
    expect(rCatchFn).toHaveBeenCalledTimes(1);
    expect(tCatchFn).not.toHaveBeenCalled();
  });
});
