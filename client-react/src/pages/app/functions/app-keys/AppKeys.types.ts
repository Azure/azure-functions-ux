import { ArmObj } from '../../../../models/arm-obj';
import { KeyValue } from '../../../../models/portal-models';
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
  functionKeys: KeyValue<string>;
  systemKeys: KeyValue<string>;
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
