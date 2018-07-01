export interface SlotsDiff {
  type: string,
  settingType: string,
  diffRule: string,
  settingName: string,
  valueInCurrentSlot: string,
  valueInTargetSlot: string,
  description: string
}