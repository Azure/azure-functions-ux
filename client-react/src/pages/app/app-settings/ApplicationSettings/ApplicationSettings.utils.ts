import i18next from 'i18next';
import { FormAppSetting } from '../AppSettings.types';
export const getErrorMessage = (newValue: string, t: i18next.TFunction) => {
  try {
    const obj = JSON.parse(newValue) as unknown;

    if (!(obj instanceof Array)) {
      return t('valuesMustBeAnArray');
    }
    let err = '';
    obj.forEach(setting => {
      const keys = Object.keys(setting);
      if (!keys.includes('name')) {
        err = t('nameIsRequired');
        return;
      }
      if (!keys.includes('value')) {
        err = t('valueIsRequired');
        return;
      }
      if (typeof setting.value !== 'string') {
        err = t('valueMustBeAString');
        return;
      }
      if (typeof setting.name !== 'string') {
        err = t('nameMustBeAString');
        return;
      }
      if (setting.slotSetting && typeof setting.slotSetting !== 'boolean') {
        err = t('slotSettingMustBeBoolean');
        return;
      }
      const { name, value, slotSetting, ...improperProperties } = setting;
      const improperKeys = Object.keys(improperProperties);
      if (improperKeys.length > 0) {
        err = t('invalidAppSettingProperty').format(improperKeys[0]);
        return;
      }
    });
    const nameList = obj.map(s => s.name);
    const uniqueNameList = [...Array.from(new Set(nameList))];
    if (nameList.length !== uniqueNameList.length) {
      err = t('appSettingNamesUnique');
    }
    return err;
  } catch {
    return t('jsonInvalid');
  }
};

export const formAppSettingToUseSlotSetting = (appSettings: FormAppSetting[]): string => {
  return JSON.stringify(
    appSettings.map(x => ({
      name: x.name,
      value: x.value,
      slotSetting: x.sticky,
    })),
    null,
    2
  );
};

export const formAppSettingToUseStickySetting = (appSettings: string): FormAppSetting[] => {
  return JSON.parse(appSettings).map(x => ({
    name: x.name,
    value: x.value,
    sticky: x.slotSetting,
  }));
};
