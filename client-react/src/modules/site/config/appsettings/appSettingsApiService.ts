import { ArmObj } from '../../../../models/WebAppModels';
import MakeArmCall from '../../../ArmHelper';
import { RootState } from '../../../types';
import { AppSettings } from './reducer';

const appSettingsApiService = {
  fetchAppSettings: (state: RootState): Promise<ArmObj<AppSettings>> => {
    const resourceId = `${state.site.resourceId}/config/appsettings/list`;
    return MakeArmCall({ resourceId, commandName: 'FetchAppSettings', method: 'POST' });
  },
  updateAppSettings: (state: RootState, newAppSettings: ArmObj<AppSettings>) => {
    const resourceId = `${state.site.resourceId}/config/appsettings`;
    return MakeArmCall({
      resourceId,
      commandName: 'UpdateAppSettings',
      method: 'PUT',
      body: newAppSettings,
    });
  },
};

export default appSettingsApiService;
