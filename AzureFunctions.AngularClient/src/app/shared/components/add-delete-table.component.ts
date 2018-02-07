import { Input, OnChanges, SimpleChanges, QueryList } from '@angular/core';
import { FormArray } from '@angular/forms';
import { CustomFormControl, CustomFormGroup } from './../../controls/click-to-edit/click-to-edit.component';
import { PortalResources } from './../../shared/models/portal-resources';
import { TableCellTemplateDirective }  from 'app/controls/table-cell/table-cell-template.directive';

export class AddDeleteTableComponent implements OnChanges {
    @Input() name: string;
    @Input() groupArray: FormArray;
    @Input() noInputMessage: string;
    @Input() emptyTableMessage: string;
    @Input() allowModification: boolean;
    @Input() addItemLabel: string;
    @Input() getNewItem: () => CustomFormGroup;
    @Input() cellTemplates: QueryList<TableCellTemplateDirective>;

    public newItem: CustomFormGroup;
    public originalItemsDeleted: number;

    public Resources = PortalResources;

    constructor() {
        this._resetNewAndDeleted();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['groupArray']) {
            this.newItem = null;
            this.originalItemsDeleted = 0;

            if (this.groupArray) {
                this.validateAllControls();
            }
        }
    }

    private _resetNewAndDeleted() {
        this.newItem = null;
        this.originalItemsDeleted = 0;
    }

    purgePristineNewItems() {
        const groups = (this.groupArray.controls as CustomFormGroup[]);

        // Purge any added entries that were never modified
        for (let i = groups.length - 1; i >= 0; i--) {
            if (groups[i].msStartInEditMode && groups[i].pristine) {
                groups.splice(i, 1);
                if (groups[i] === this.newItem) {
                    this.newItem = null;
                }
            }
        }
    }

    validateAllControls() {
        const groups = (this.groupArray.controls as CustomFormGroup[]);

        groups.forEach(group => {
            const controls = (group).controls;
            for (const controlName in controls) {
                const control = controls[controlName] as CustomFormControl;
                control._msRunValidation = true;
                control.updateValueAndValidity();
            }
        });
    }

    deleteItem(group: CustomFormGroup) {
        if (this.allowModification) {
            const groups = (this.groupArray.controls as CustomFormGroup[]);

            const index = groups.indexOf(group);
            if (index >= 0) {
                if (group.msExistenceState === 'original') {
                    this._deleteOriginalItem(this.groupArray, group);
                } else {
                    this._deleteAddedItem(this.groupArray, group, index);
                }
            }
        }
    }

    private _deleteOriginalItem(groups: FormArray, group: CustomFormGroup) {
        // Keep the deleted group around with its state set to dirty.
        // This keeps the overall state of this.groupArray and this.mainForm dirty.
        group.markAsDirty();

        // Set the group.msExistenceState to 'deleted' so we know to ignore it when validating and saving.
        group.msExistenceState = 'deleted';

        // Force the deleted group to have a valid state by clear all validators on the controls and then running validation.
        for (const key in group.controls) {
            const control = group.controls[key];
            control.clearAsyncValidators();
            control.clearValidators();
            control.updateValueAndValidity();
        }

        this.originalItemsDeleted++;

        groups.parent.updateValueAndValidity();
    }

    private _deleteAddedItem(groups: FormArray, group: CustomFormGroup, index: number) {
        // Remove group from groups
        groups.removeAt(index);
        if (group === this.newItem) {
            this.newItem = null;
        }

        // If group was dirty, then groups is also dirty.
        // If all the remaining controls in groups are pristine, mark groups as pristine.
        if (!group.pristine) {
            let pristine = true;
            for (const control of groups.controls) {
                pristine = pristine && control.pristine;
            }

            if (pristine) {
                groups.markAsPristine();
            }
        }

        groups.updateValueAndValidity();
    }

    addItem() {
        if (!!this.groupArray && this.allowModification && (!this.newItem || !this.newItem.pristine)) {
            this.newItem = this.getNewItem();
            this.newItem.msExistenceState = 'new';
            this.newItem.msStartInEditMode = true;

            this.groupArray.push(this.newItem);
        }
    }
}
