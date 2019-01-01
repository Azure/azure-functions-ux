import { ArmObj, Site } from '../../models/WebAppModels';
import { MakeArmCall } from '../ApiHelpers';
import { RootState } from '../types';

const siteApiService = {
  fetchSite: (state: RootState): Promise<ArmObj<Site>> => {
    const resourceId = state.site.resourceId;
    return MakeArmCall<ArmObj<Site>>(state, resourceId);
  },
  updateSite: (state: RootState, site: ArmObj<Site>): Promise<ArmObj<Site>> => {
    const resourceId = state.site.resourceId;
    return MakeArmCall<ArmObj<Site>>(state, resourceId, 'PUT', site);
  },
};

export default siteApiService;

// // HELPER FUNCTIONS
// const getAppSettingsForUpdate = (getState: () => RootState, appSettings?: AppSetting[]): any | undefined => {
//   if (!appSettings) {
//     return undefined;
//   }

//   const appSettingsClean = appSettings.map(
//     x =>
//       ({
//         name: x.name,
//         value: x.value,
//       } as NameValuePair)
//   );
//   return appSettingsClean;
// };

// const getConnectionStringsForUpdate = (getState: () => RootState, connectionStrings?: ConnectionString[]): any | undefined => {
//   if (!connectionStrings) {
//     return undefined;
//   }
//   const connectionStringsClean = connectionStrings.map(x => ({
//     name: x.name,
//     //connectionString: x.value,
//     type: +x.type,
//   }));
//   return connectionStringsClean;
// };

// const getMetadataForUpdate = (getState: () => RootState, metadata?: ArmObj<{ [key: string]: string }>): any | undefined => {
//   if (!metadata) {
//     return undefined;
//   }
//   const md = Object.keys(metadata.properties).map(name => {
//     return {
//       name,
//       value: metadata.properties[name],
//     };
//   });
//   return md;
// };
// const updateStickySettings = async (
//   dispatch: any,
//   getState: () => RootState,
//   connectionStrings?: ConnectionString[],
//   appSettings?: AppSetting[]
// ): Promise<void> => {
//   if (!connectionStrings && !appSettings) {
//     return;
//   }

//   const currentSlotConfigNames = getState().slotConfigNames.data.properties;
//   const newSlotConfigNames = { ...currentSlotConfigNames };
//   if (appSettings) {
//     const appSettingConfigNames = appSettings.filter(x => x.sticky).map(x => x.name);
//     newSlotConfigNames.appSettingNames = uniq(newSlotConfigNames.appSettingNames.concat(appSettingConfigNames));
//   }
//   // if (connectionStrings) {
//   //   const connectionStringSlotNames = connectionStrings.filter(x => x.sticky).map(x => x.name);
//   //   newSlotConfigNames.connectionStringNames = uniq(newSlotConfigNames.connectionStringNames.concat(connectionStringSlotNames));
//   // }

//   const appSettingsDifference = xor(currentSlotConfigNames.appSettingNames.sort(), newSlotConfigNames.appSettingNames.sort());
//   const connectionstringDifference = xor(
//     currentSlotConfigNames.connectionStringNames.sort(),
//     newSlotConfigNames.connectionStringNames.sort()
//   );
//   if (appSettingsDifference.length > 0 || connectionstringDifference.length > 0) {
//     //await dispatch(updateSlotConfigNames(newSlotConfigNames));
//   }
// };
