import i18next from 'i18next';
import { FormConnectionString } from '../AppSettings.types';
import * as Joi from 'joi';
import { TypeStrings } from './connectionStringTypes';
const getSchema = (disableSlotSetting: boolean): Joi.ArraySchema => {
  const slotSettingSchema = disableSlotSetting ? Joi.boolean().forbidden() : Joi.boolean().optional();
  return Joi.array()
    .unique('name')
    .items(
      Joi.object().keys({
        name: Joi.string().required(),
        value: Joi.string().required(),
        type: Joi.required().valid(TypeStrings),
        slotSetting: slotSettingSchema,
      })
    );
};
export const getErrorMessage = (newValue: string, disableSlotSetting: boolean, t: i18next.TFunction) => {
  try {
    const obj = JSON.parse(newValue) as unknown;

    const result = Joi.validate(obj, getSchema(disableSlotSetting));
    if (!result.error) {
      return '';
    }
    const details = result.error.details[0];
    switch (details.type) {
      case 'array.base':
        return t('connectionStringValuesMustBeAnArray');
      case 'any.required':
        return t('connectionStringPropIsRequired').format(details.context!.key);
      case 'string.base':
        return t('connectionStringValueMustBeAString');
      case 'boolean.base':
        return t('slotSettingMustBeBoolean');
      case 'object.allowUnknown':
        return t('connectionStringInvalidProperty').format(details.context!.key);
      case 'array.unique':
        return t('connectionStringNamesUnique');
      case 'any.allowOnly':
        return details.message;
      case 'any.unknown':
        return disableSlotSetting && details.context!.key === 'slotSetting'
          ? t('slotSettingForbiddenProperty').format(details.context!.key)
          : t('jsonInvalid');
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
