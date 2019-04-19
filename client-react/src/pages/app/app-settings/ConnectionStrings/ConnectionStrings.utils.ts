import i18next from 'i18next';
import { FormConnectionString } from '../AppSettings.types';
import * as Joi from 'joi';
import { TypeStrings } from './connectionStringTypes';
const schema = Joi.array()
  .unique('name')
  .items(
    Joi.object().keys({
      name: Joi.string().required(),
      value: Joi.string()
        .required()
        .allow(''),
      type: Joi.required().valid(TypeStrings),
      slotSetting: Joi.boolean().optional(),
    })
  );
export const getErrorMessage = (newValue: string, t: i18next.TFunction) => {
  try {
    const obj = JSON.parse(newValue) as unknown;

    const result = Joi.validate(obj, schema);
    if (!result.error) {
      return '';
    }
    const details = result.error.details[0];
    switch (details.type) {
      case 'array.base':
        return t('valuesMustBeAnArray');
      case 'any.required':
        return t('appSettingPropIsRequired').format(details.context!.key);
      case 'string.base':
        return t('valueMustBeAString');
      case 'boolean.base':
        return t('slotSettingMustBeBoolean');
      case 'object.allowUnknown':
        return t('invalidAppSettingProperty').format(details.context!.key);
      case 'array.unique':
        return t('appSettingNamesUnique');
      case 'any.allowOnly':
        return details.message;
      default:
        return t('jsonInvalid');
    }
  } catch (err) {
    return t('jsonInvalid');
  }
};

export const formConnectionStringsoUseSlotSetting = (connectionStrings: FormConnectionString[]): string => {
  return JSON.stringify(
    connectionStrings.map(x => ({
      name: x.name,
      value: x.value,
      type: x.type,
      slotSetting: x.sticky,
    })),
    null,
    2
  );
};

export const formAppSettingToUseStickySetting = (connectionStrings: string): FormConnectionString[] => {
  return JSON.parse(connectionStrings).map(x => ({
    name: x.name,
    value: x.value,
    type: x.type,
    sticky: x.slotSetting,
  }));
};
