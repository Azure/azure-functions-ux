import { ArmObj } from '../../../../models/WebAppModels';
import { MakeArmCall } from '../../../ApiHelpers';
import { RootState } from '../../../types';
import { AppSettings } from './reducer';

const appSettingsApiService = {
  fetchAppSettings: (state: RootState): Promise<ArmObj<AppSettings>> => {
    const resourceId = `${state.site.resourceId}/config/appsettings/list`;
    return MakeArmCall(state, resourceId, 'POST');
  },
  updateAppSettings: (state: RootState, newAppSettings: ArmObj<AppSettings>) => {
    const resourceId = `${state.site.resourceId}/config/appsettings`;
    return MakeArmCall(state, resourceId, 'PUT', newAppSettings);
  },
};

export default appSettingsApiService;
