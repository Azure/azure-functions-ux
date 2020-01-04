import i18next from 'i18next';
import { FormAppSetting } from '../AppSettings.types';
import * as Joi from 'joi';
const getSchema = (disableSlotSetting: boolean, isLinux: boolean): Joi.ArraySchema => {
  const slotSettingSchema = disableSlotSetting ? Joi.boolean().forbidden() : Joi.boolean().optional();
  const nameSchema = isLinux
    ? Joi.string()
        .required()
        // eslint-disable-next-line no-useless-escape
        .regex(/^[\w|\.]*$/)
    : Joi.string().required();
  return Joi.array()
    .unique((a, b) => a.name.toLowerCase() === b.name.toLowerCase())
    .items(
      Joi.object().keys({
        name: nameSchema,
        value: Joi.string()
          .required()
          .allow(''),
        slotSetting: slotSettingSchema,
      })
    );
};
export const getErrorMessage = (newValue: string, disableSlotSetting: boolean, isLinux: boolean, t: i18next.TFunction) => {
  try {
    const obj = JSON.parse(newValue) as unknown;
    const schema = getSchema(disableSlotSetting, isLinux);
    const result = Joi.validate(obj, schema);
    if (!result.error) {
      return '';
    }
    const details = result.error.details[0];
    switch (details.type) {
      case 'array.base':
        return t('appSettingValuesMustBeAnArray');
      case 'any.required':
        return t('appSettingPropIsRequired').format(details.context!.key);
      case 'string.base':
        return t('appSettingValueMustBeAString');
      case 'string.regex.base':
        return t('validation_linuxAppSettingNameError');
      case 'boolean.base':
        return t('slotSettingMustBeBoolean');
      case 'object.allowUnknown':
        return t('appSettingInvalidProperty').format(details.context!.key);
      case 'array.unique':
        return t('appSettingNamesUnique');
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

const getAppSettingObjectForMonacoEditor = (appSetting: FormAppSetting, disableSlotSetting: boolean) => {
  return disableSlotSetting
    ? {
        name: appSetting.name,
        value: appSetting.value,
      }
    : {
        name: appSetting.name,
        value: appSetting.value,
        slotSetting: appSetting.sticky,
      };
};

const getAppSettingStickyValue = (appSettingName: string, initialAppSettings: FormAppSetting[]): boolean => {
  const appSettingIndex = initialAppSettings.findIndex(x => {
    if (x.name.toLowerCase() === appSettingName.toLowerCase()) {
      return true;
    }
    return false;
  });
  return appSettingIndex >= 0 ? initialAppSettings[appSettingIndex].sticky : false;
};

export const formAppSettingToUseSlotSetting = (appSettings: FormAppSetting[], disableSlotSetting: boolean): string => {
  return JSON.stringify(appSettings.map(x => getAppSettingObjectForMonacoEditor(x, disableSlotSetting)), null, 2);
};

export const formAppSettingToUseStickySetting = (
  appSettings: string,
  disableSlotSetting: boolean,
  initialAppSetting: FormAppSetting[]
): FormAppSetting[] => {
  return JSON.parse(appSettings).map(x => ({
    name: x.name,
    value: x.value,
    sticky: disableSlotSetting ? getAppSettingStickyValue(x.name, initialAppSetting) : x.slotSetting,
  }));
};
