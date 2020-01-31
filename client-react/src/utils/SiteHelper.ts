import { FunctionAppEditMode } from '../models/portal-models';

export default class SiteHelper {
  public static isFunctionAppReadOnly(editMode: FunctionAppEditMode): boolean {
    return (
      editMode === FunctionAppEditMode.ReadOnly ||
      editMode === FunctionAppEditMode.ReadOnlySourceControlled ||
      editMode === FunctionAppEditMode.ReadOnlySlots ||
      editMode === FunctionAppEditMode.ReadOnlyVSGenerated ||
      editMode === FunctionAppEditMode.ReadOnlyRunFromZip ||
      editMode === FunctionAppEditMode.ReadOnlyLocalCache ||
      editMode === FunctionAppEditMode.ReadOnlyLinuxDynamic ||
      editMode === FunctionAppEditMode.ReadOnlyBYOC ||
      editMode === FunctionAppEditMode.ReadOnlyPython ||
      editMode === FunctionAppEditMode.ReadOnlyJava ||
      editMode === FunctionAppEditMode.ReadOnlyLinuxCodeElastic
    );
  }
}
