import { FunctionAppEditMode } from '../models/portal-models';
import i18n from './i18n';

export default class SiteHelper {
  public static isFunctionAppReadOnly(editMode: FunctionAppEditMode): boolean {
    return (
      editMode === FunctionAppEditMode.ReadOnly ||
      editMode === FunctionAppEditMode.ReadOnlySourceControlled ||
      editMode === FunctionAppEditMode.ReadOnlySlots ||
      editMode === FunctionAppEditMode.ReadOnlyVSGenerated ||
      editMode === FunctionAppEditMode.ReadOnlyRunFromPackage ||
      editMode === FunctionAppEditMode.ReadOnlyLocalCache ||
      editMode === FunctionAppEditMode.ReadOnlyLinuxDynamic ||
      editMode === FunctionAppEditMode.ReadOnlyBYOC ||
      editMode === FunctionAppEditMode.ReadOnlyPython ||
      editMode === FunctionAppEditMode.ReadOnlyJava ||
      editMode === FunctionAppEditMode.ReadOnlyLinuxCodeElastic
    );
  }

  public static getFunctionAppEditModeString(mode: FunctionAppEditMode, t: i18n.TFunction): string {
    switch (mode) {
      case FunctionAppEditMode.ReadOnlySourceControlled: {
        return t('readOnlySourceControlled');
      }
      case FunctionAppEditMode.ReadOnlySlots: {
        return t('readOnlySlots');
      }
      case FunctionAppEditMode.ReadOnlyVSGenerated: {
        return t('readOnlyVSGenerated');
      }
      case FunctionAppEditMode.ReadOnlyRunFromPackage: {
        return t('readOnlyRunFromZip');
      }
      case FunctionAppEditMode.ReadOnlyLocalCache: {
        return t('readOnlyLocalCache');
      }
      case FunctionAppEditMode.ReadOnlyLinuxDynamic: {
        return t('readOnlyLinuxDynamic');
      }
      case FunctionAppEditMode.ReadOnlyBYOC: {
        return t('readOnlyBYOC');
      }
      case FunctionAppEditMode.ReadOnlyPython: {
        return t('readOnlyPython');
      }
      case FunctionAppEditMode.ReadOnlyJava: {
        return t('readOnlyJava');
      }
    }
    return t('readOnly');
  }
}
