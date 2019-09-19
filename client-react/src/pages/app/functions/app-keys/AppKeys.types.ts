import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';

export interface AppKeysModel {
  name: string;
  value: string;
}

export interface FormSystemKeys {
  name: string;
  value: string;
}

export interface AppKeysInfo {
  masterKey: string;
  functionKeys: { [key: string]: string };
  systemKeys: { [key: string]: string };
}

export interface AppKeysFormValues {
  site: ArmObj<Site>;
  hostKeys: AppKeysModel[];
  systemKeys: AppKeysModel[];
}

export enum AppKeysTypes {
  masterKey = 'masterKey',
  functionKeys = 'functionKeys',
  systemKeys = 'systemKeys',
}
