import { ArmObj } from '../../../../models/arm-obj';
import { Site } from '../../../../models/site/site';

export interface FormHostKeys {
  name: string;
  value: string;
}

export interface FormSystemKeys {
  name: string;
  value: string;
}

export interface AppKeysFormValues {
  site: ArmObj<Site>;
  hostKeys: FormHostKeys[];
  systemKeys: FormSystemKeys[];
}
