export type DiffRule = 'SlotSettingsMissing'
  | 'SettingsNotInSource'
  | 'SlotSettingsSameValue'
  | 'SettingsWillBeModifiedInDestination'
  | 'SettingsWillBeAddedToDestination';

export interface SimpleSlotsDiff {
  settingType: string;
  settingName: string;
  valueInCurrentSlot: string;
  valueInTargetSlot: string;
}

export interface SlotsDiff extends SimpleSlotsDiff {
  type: string;
  diffRule: DiffRule;
  description: string;
}