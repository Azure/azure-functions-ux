import mockAxios from 'jest-mock-axios';

import { MakeArmCall } from './ArmHelper';
import { RootState } from './types';

const testResult = {
  id: '',
  name: 'testval',
  location: '',
  kind: '',
};
const testBody = {
  id: '',
  name: 'testbody',
  location: '',
  kind: '',
};
const stateGood = {
  portalService: {
    startupInfo: {
      token: 'testtoken',
      armEndpoint: 'testendpoint',
    },
  },
} as RootState;

const stateUninitialized = {
  portalService: {
    startupInfo: null,
  },
} as RootState;

describe('MakeArmCall', () => {
  let thenFn = jest.fn();
  let catchFn = jest.fn();
  afterEach(() => {
    mockAxios.reset();
    thenFn.mockClear();
    catchFn.mockClear();
  });

  describe('Error Cases', () => {
    it('Throws error if start up info is uninitialzied', async () => {
      const fetcher = MakeArmCall(stateUninitialized, 'resourceid')
        .then(thenFn)
        .catch(catchFn);
      expect(mockAxios).not.toHaveBeenCalled();
      await fetcher;
      expect(catchFn).toHaveBeenCalled();
    });

    it('Throws appropriate error is call fails', async () => {
      const fetcher = MakeArmCall(stateGood, 'resourceid')
        .then(thenFn)
        .catch(catchFn);
      expect(mockAxios).toHaveBeenCalled();
      mockAxios.mockError({ status: 401 });
      await fetcher;
      expect(catchFn).toHaveBeenCalledWith({ status: 401 });
    });
  });

  describe('API parameters', () => {
    it('GET with defaults sends appropriate call', async () => {
      const fetcher = MakeArmCall(stateGood, 'resourceid')
        .then(thenFn)
        .catch(catchFn);
      expect(mockAxios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'testendpointresourceid?api-version=2018-02-01',
        data: null,
        headers: {
          Authorization: `Bearer testtoken`,
        },
      });
      mockAxios.mockResponse({ data: testResult });
      await fetcher;
      expect(thenFn).toHaveBeenCalledWith(testResult);
    });

    it('POST with defaults sends appropriate call', async () => {
      const fetcher = MakeArmCall(stateGood, 'resourceid', 'POST')
        .then(thenFn)
        .catch(catchFn);
      expect(mockAxios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'testendpointresourceid?api-version=2018-02-01',
        data: null,
        headers: {
          Authorization: `Bearer testtoken`,
        },
      });
      mockAxios.mockResponse({ data: testResult });
      await fetcher;
      expect(thenFn).toHaveBeenCalledWith(testResult);
    });

    it('PUT with defaults sends appropriate call', async () => {
      const fetcher = MakeArmCall(stateGood, 'resourceid', 'PUT')
        .then(thenFn)
        .catch(catchFn);
      expect(mockAxios).toHaveBeenCalledWith({
        method: 'PUT',
        url: 'testendpointresourceid?api-version=2018-02-01',
        data: null,
        headers: {
          Authorization: `Bearer testtoken`,
        },
      });
      mockAxios.mockResponse({ data: testResult });
      await fetcher;
      expect(thenFn).toHaveBeenCalledWith(testResult);
    });

    it('DELETE with defaults sends appropriate call', async () => {
      const fetcher = MakeArmCall(stateGood, 'resourceid', 'DELETE')
        .then(thenFn)
        .catch(catchFn);
      expect(mockAxios).toHaveBeenCalledWith({
        method: 'DELETE',
        url: 'testendpointresourceid?api-version=2018-02-01',
        data: null,
        headers: {
          Authorization: `Bearer testtoken`,
        },
      });
      mockAxios.mockResponse({ data: testResult });
      await fetcher;
      expect(thenFn).toHaveBeenCalledWith(testResult);
    });

    it('POST with body gets passed correctly', async () => {
      MakeArmCall(stateGood, 'resourceid', 'POST', testBody);
      expect(mockAxios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'testendpointresourceid?api-version=2018-02-01',
        data: testBody,
        headers: {
          Authorization: `Bearer testtoken`,
        },
      });
    });

    it('Api Verison gets set correctly', async () => {
      MakeArmCall(stateGood, 'resourceid', '', 'GET', null, true, 'testApiVersion');
      expect(mockAxios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'testendpointresourceid?api-version=testApiVersion',
        data: null,
        headers: {
          Authorization: `Bearer testtoken`,
        },
      });
    });
  });
});
