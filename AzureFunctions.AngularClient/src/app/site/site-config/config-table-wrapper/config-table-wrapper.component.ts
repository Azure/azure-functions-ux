import { Component, Input, ViewChild, QueryList, OnChanges, SimpleChanges } from '@angular/core';
import { FormArray } from '@angular/forms';
import { CustomFormGroup } from 'app/controls/click-to-edit/click-to-edit.component';
import { TableCellTemplateDirective }  from 'app/controls/table-cell/table-cell-template.directive';
import { ConfigTableComponent }  from './../config-table/config-table.component';

@Component({
    selector: 'config-table-wrapper',
    templateUrl: './config-table-wrapper.component.html',
    styleUrls: ['./../site-config.component.scss']
})
export class ConfigTableWrapperComponent implements OnChanges {
    public noInputMessage: string;
    @Input() name: string;
    @Input() groupArray: FormArray;
    @Input() hasWritePermissions: boolean;
    @Input() showPermissionsMessage: boolean;
    @Input() permissionsMessage: string;
    @Input() loadingFailureMessage: string;
    @Input() loadingMessage: string;
    @Input() emptyTableMessage: string;
    @Input() addItemLabel: string;
    @Input() getNewItem: () => CustomFormGroup;
    @Input() cellTemplates: QueryList<TableCellTemplateDirective>;

    @ViewChild(ConfigTableComponent) configTable: ConfigTableComponent;

    ngOnChanges(changes: SimpleChanges) {
        if (!this.groupArray) {
            if (this.hasWritePermissions) {
                this.noInputMessage = this.loadingFailureMessage || this.loadingMessage;
            } else {
                this.noInputMessage = (this.showPermissionsMessage) ? this.permissionsMessage : '';
            }
        } else {
            this.noInputMessage = null;
        }
    }
}