import { FunctionAppEditMode } from 'app/shared/models/function-app-edit-mode';

export class EditModeHelper {
    public static isReadOnly(editMode: FunctionAppEditMode): boolean {
        return editMode === FunctionAppEditMode.ReadOnly ||
            editMode === FunctionAppEditMode.ReadOnlySourceControlled ||
            editMode === FunctionAppEditMode.ReadOnlySlots;
    }
}
