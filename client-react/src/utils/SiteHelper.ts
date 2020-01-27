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
    let modeString = t('readOnly');
    switch (mode) {
      case FunctionAppEditMode.ReadOnlySourceControlled: {
        modeString = t('readOnlySourceControlled');
        break;
      }
      case FunctionAppEditMode.ReadOnlySlots: {
        modeString = t('readOnlySlots');
        break;
      }
      case FunctionAppEditMode.ReadOnlyVSGenerated: {
        modeString = t('readOnlyVSGenerated');
        break;
      }
      case FunctionAppEditMode.ReadOnlyRunFromPackage: {
        modeString = t('readOnlyRunFromZip');
        break;
      }
      case FunctionAppEditMode.ReadOnlyLocalCache: {
        modeString = t('readOnlyLocalCache');
        break;
      }
      case FunctionAppEditMode.ReadOnlyLinuxDynamic: {
        modeString = t('readOnlyLinuxDynamic');
        break;
      }
      case FunctionAppEditMode.ReadOnlyBYOC: {
        modeString = t('readOnlyBYOC');
        break;
      }
      case FunctionAppEditMode.ReadOnlyPython: {
        modeString = t('readOnlyPython');
        break;
      }
      case FunctionAppEditMode.ReadOnlyJava: {
        modeString = t('readOnlyJava');
        break;
      }
    }
    return modeString;
  }
}
