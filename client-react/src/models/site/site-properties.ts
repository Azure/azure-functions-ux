import { NameValuePair } from '../name-value-pair';

export interface SiteProperties {
  metadata: NameValuePair[];
  properties: NameValuePair[];
  appSettings: NameValuePair[];
}
