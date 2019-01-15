import { getArmEndpointAndTokenFromState } from './StateUtilities';

describe('getArmEndpointAndTokenFromState', () => {
  it('Should return auth token and arm endpoint from state', () => {
    const state = {
      portalService: {
        startupInfo: {
          token: 'token',
          armEndpoint: 'endpoint',
        },
      },
    } as any;
    const { authToken, armEndpoint } = getArmEndpointAndTokenFromState(state);
    expect(authToken).toEqual('token');
    expect(armEndpoint).toEqual('endpoint');
  });

  it('Should throw error if state is not initialized yet', () => {
    const state = {
      portalService: {
        startupInfo: null,
      },
    } as any;
    expect(() => getArmEndpointAndTokenFromState(state)).toThrow();
  });
});
