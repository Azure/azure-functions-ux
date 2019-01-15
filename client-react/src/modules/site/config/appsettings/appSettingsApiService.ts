import { ArmObj } from '../../../../models/WebAppModels';
import MakeArmCall from '../../../ArmHelper';
import { RootState } from '../../../types';
import { AppSettings } from './reducer';
import { getArmEndpointAndTokenFromState } from '../../../StateUtilities';

const appSettingsApiService = {
  fetchAppSettings: (state: RootState): Promise<ArmObj<AppSettings>> => {
    const resourceId = `${state.site.resourceId}/config/appsettings/list`;
    const { armEndpoint, authToken } = getArmEndpointAndTokenFromState(state);
    return MakeArmCall(armEndpoint, authToken, resourceId, 'FetchAppSettings', 'POST');
  },
  updateAppSettings: (state: RootState, newAppSettings: ArmObj<AppSettings>) => {
    const resourceId = `${state.site.resourceId}/config/appsettings`;
    const { authToken, armEndpoint } = getArmEndpointAndTokenFromState(state);
    return MakeArmCall(armEndpoint, authToken, resourceId, 'UpdateAppSettings', 'PUT', newAppSettings);
  },
};

export default appSettingsApiService;
