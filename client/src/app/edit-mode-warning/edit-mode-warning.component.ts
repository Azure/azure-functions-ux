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
  styleUrls: ['./edit-mode-warning.component.scss'],
})
export class EditModeWarningComponent implements OnInit {
  @Input()
  context: FunctionAppContext;

  public readOnly = false;
  public readOnlySourceControlled = false;
  public readWriteSourceControlled = false;
  public readOnlySlots = false;
  public readOnlyVSGenerated = false;
  public readWriteVSGenerated = false;
  public readOnlyRunFromZip = false;
  public readOnlyLocalCache = false;
  public readOnlyLinuxDynamic = false;
  public readOnlyBYOC = false;
  public readOnlyPython = false;
  public isEmpty = true;

  constructor(private _functionAppService: FunctionAppService, private _broadcastService: BroadcastService) {}

  ngOnInit() {
    if (this.context) {
      this._functionAppService.getFunctionAppEditMode(this.context).subscribe(editModeResult => {
        if (editModeResult.isSuccessful) {
          const editMode = editModeResult.result;
          let isEmpty = false;
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
          } else if (editMode === FunctionAppEditMode.ReadOnlyRunFromZip) {
            this.readOnlyRunFromZip = true;
          } else if (editMode === FunctionAppEditMode.ReadOnlyLocalCache) {
            this.readOnlyLocalCache = true;
          } else if (editMode === FunctionAppEditMode.ReadOnlyLinuxDynamic) {
            this.readOnlyLinuxDynamic = true;
          } else if (editMode === FunctionAppEditMode.ReadOnlyBYOC) {
            this.readOnlyBYOC = true;
          } else if (editMode === FunctionAppEditMode.ReadOnlyPython) {
            this.readOnlyPython = true;
          } else {
            isEmpty = true;
          }
          this.isEmpty = isEmpty;
        }
      });
    }
  }

  onFunctionAppSettingsClicked() {
    this._broadcastService.broadcastEvent<TreeUpdateEvent>(BroadcastEvent.TreeUpdate, {
      operation: 'navigate',
      resourceId: this.context.site.id,
      data: SiteTabIds.functionRuntime,
    });
  }
}
