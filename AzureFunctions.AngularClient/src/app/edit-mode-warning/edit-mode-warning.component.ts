import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionAppContext } from './../shared/function-app-context';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { SiteTabIds } from './../shared/models/constants';
import { BroadcastEvent } from 'app/shared/models/broadcast-event';
import { TreeUpdateEvent } from './../shared/models/broadcast-event';
import { Component, OnInit, Input } from '@angular/core';
import { FunctionAppEditMode } from '../shared/models/function-app-edit-mode';

@Component({
    selector: 'app-edit-mode-warning',
    templateUrl: './edit-mode-warning.component.html',
    styleUrls: ['./edit-mode-warning.component.scss']
})
export class EditModeWarningComponent implements OnInit {

    @Input() context: FunctionAppContext;

    public readOnly = false;
    public readOnlySourceControlled = false;
    public readWriteSourceControlled = false;
    public readOnlySlots = false;
    public readOnlyVSGenerated = false;
    public readWriteVSGenerated = false;

    constructor(private _functionAppService: FunctionAppService, private _broadcastService: BroadcastService) { }

    ngOnInit() {
        if (this.context) {
            this._functionAppService
                .getFunctionAppEditMode(this.context)
                .subscribe(editModeResult => {
                    if (editModeResult.isSuccessful) {
                        const editMode = editModeResult.result;
                        if (editMode === FunctionAppEditMode.ReadOnly) {
                            this.readOnly = true;
                        } else if (editMode === FunctionAppEditMode.ReadOnlySourceControlled) {
                            this.readOnlySourceControlled = true;
                        } else if (editMode === FunctionAppEditMode.ReadWriteSourceControlled) {
                            this.readWriteSourceControlled = true;
                        } else if (editMode === FunctionAppEditMode.ReadOnlySlots) {
                            this.readOnlySlots = true;
                        } else if (editMode === FunctionAppEditMode.ReadOnlyVSGenerated) {
                            this.readOnlyVSGenerated = true;
                        } else if (editMode === FunctionAppEditMode.ReadWriteVSGenerated) {
                            this.readWriteVSGenerated = true;
                        }
                    }
                });
        }
    }

    onFunctionAppSettingsClicked() {
        this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
            operation: 'navigate',
            resourceId: this.context.site.id,
            data: SiteTabIds.functionRuntime
        });
    }
}
