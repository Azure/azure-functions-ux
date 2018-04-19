import { AppNode } from './../tree-view/app-node';
import { FunctionApp } from './../shared/function-app';
import { Component, OnInit, Input } from '@angular/core';
import { FunctionAppEditMode } from '../shared/models/function-app-edit-mode';

@Component({
  selector: 'app-edit-mode-warning',
  templateUrl: './edit-mode-warning.component.html',
  styleUrls: ['./edit-mode-warning.component.scss']
})
export class EditModeWarningComponent implements OnInit {

  @Input() functionApp: FunctionApp;
  @Input() appNode: AppNode;

  public readOnly = false;
  public readOnlySourceControlled = false;
  public readWriteSourceControlled = false;
  public readOnlySlots = false;

  ngOnInit() {
    this.functionApp &&
      this.functionApp
        .getFunctionAppEditMode()
        .subscribe(editMode => {
          if (editMode === FunctionAppEditMode.ReadOnly) {
            this.readOnly = true;
          } else if (editMode === FunctionAppEditMode.ReadOnlySourceControlled) {
            this.readOnlySourceControlled = true;
          } else if (editMode === FunctionAppEditMode.ReadWriteSourceControlled) {
            this.readWriteSourceControlled = true;
          } else if (editMode === FunctionAppEditMode.ReadOnlySlots) {
            this.readOnlySlots = true;
          }
        });
  }

  onFunctionAppSettingsClicked() {
    this.appNode.openSettings();
  }
}
