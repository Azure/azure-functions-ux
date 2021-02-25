import { FormAppSetting, FormConnectionString } from '../pages/app/app-settings/AppSettings.types';

export interface CreateServiceLinkerResponse {
  id: string;
  isSucceeded?: boolean;
  webAppConfiguration?: ServiceLinkerWebAppConfiguration;
}

export interface ServiceLinkerWebAppConfiguration {
  appSettings?: FormAppSetting[];
  connectionStrings?: FormConnectionString[];
}
