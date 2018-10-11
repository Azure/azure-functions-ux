import { FunctionAppEditMode } from 'app/shared/models/function-app-edit-mode';

export class EditModeHelper {
    public static isReadOnly(editMode: FunctionAppEditMode): boolean {
        return editMode === FunctionAppEditMode.ReadOnly
            || editMode === FunctionAppEditMode.ReadOnlySourceControlled
            || editMode === FunctionAppEditMode.ReadOnlySlots
            || editMode === FunctionAppEditMode.ReadOnlyVSGenerated
            || editMode === FunctionAppEditMode.ReadOnlyRunFromZip
            || editMode === FunctionAppEditMode.ReadOnlyLocalCache
            || editMode === FunctionAppEditMode.ReadOnlyLinuxDynamic
            || editMode === FunctionAppEditMode.ReadOnlyBYOC;
    }

    public static getWarningIfForced(editMode: FunctionAppEditMode): string {
        if (editMode === FunctionAppEditMode.ReadOnlyRunFromZip) {
            return 'readOnlyRunFromZip';
        } else if (editMode === FunctionAppEditMode.ReadOnlyLocalCache) {
            return 'readOnlyLocalCache';
        } else if (editMode === FunctionAppEditMode.ReadOnlyLinuxDynamic) {
            return 'readOnlyLinuxDynamic';
        } else if (editMode === FunctionAppEditMode.ReadOnlyBYOC) {
            return 'readOnlyBYOC';
        } else {
            return null;
        }
    }
}
