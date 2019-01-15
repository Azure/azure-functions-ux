import { RootState } from './types';

export const getArmEndpointAndTokenFromState = (state: RootState): { authToken: string; armEndpoint: string } => {
  const startupInfo = state.portalService.startupInfo;
  if (!startupInfo) {
    throw new Error('App not yet initialized');
  }
  const authToken = startupInfo.token;
  const armEndpoint = startupInfo.armEndpoint;
  return { authToken, armEndpoint };
};
