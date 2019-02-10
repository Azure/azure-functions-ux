import MockCall from './ArmHelper';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('Arm Helper', () => {
  let mock;
  beforeEach(() => {
    mock = new MockAdapter(axios);
  });
  it('returns data from fetch in buffer path', async () => {
    const mockData = { responses: [{ httpStatusCode: 200, content: { val: 'test' } }] };
    mock.onPost().reply(200, mockData);
    const t = await MockCall<any>({ resourceId: 'test', commandName: 'test' });
    expect(t.val).toBe('test');
  });

  it('returns data from fetch in non buffer path', async () => {
    const mockData = { val: 'test' };
    mock.onGet().reply(200, mockData);
    const t = await MockCall<any>({ resourceId: 'test', commandName: 'test', skipBuffer: true });
    expect(t.val).toBe('test');
  });

  it('Batched call should only happen once for multiple burst calls', async () => {
    const mockData = {
      responses: [{ httpStatusCode: 200, content: { val: 'test1' } }, { httpStatusCode: 200, content: { val: 'test2' } }],
    };
    mock.onPost().reply(200, mockData);
    const t = MockCall<any>({ resourceId: 'test', commandName: 'test' });
    const r = MockCall<any>({ resourceId: 'test2', commandName: 'test2' });
    const [tR, rR] = await Promise.all([t, r]);
    expect(tR.val).toBe('test1');
    expect(rR.val).toBe('test2');
    expect(mock.history.post.length).toEqual(1);
  });

  it('Should throw error when non 200 call is made only on error call', async () => {
    const mockData = {
      responses: [{ httpStatusCode: 200, content: { val: 'test1' } }, { httpStatusCode: 401, content: { val: 'test2' } }],
    };
    mock.onPost().reply(200, mockData);
    const rCatchFn = jest.fn();
    const tCatchFn = jest.fn();
    const t = MockCall<any>({ resourceId: 'test', commandName: 'test' }).catch(tCatchFn);
    const r = MockCall<any>({ resourceId: 'test2', commandName: 'test2' }).catch(rCatchFn);
    await t;
    await r;
    expect(rCatchFn).toHaveBeenCalledTimes(1);
    expect(tCatchFn).not.toHaveBeenCalled();
  });
});
