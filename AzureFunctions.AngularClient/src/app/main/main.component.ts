import { TopRightMenuComponent } from './../top-right-menu/top-right-menu.component';
import { Component, OnInit, ViewChild, AfterViewInit, Input } from '@angular/core';
import {SideNavComponent} from '../side-nav/side-nav.component';
import {TreeViewInfo} from '../tree-view/models/tree-view-info';
import {DashboardType} from '../tree-view/models/dashboard-type';
import {UserService} from '../shared/services/user.service';
import {GlobalStateService} from '../shared/services/global-state.service';
import {FunctionEditComponent} from '../function-edit/function-edit.component';
import {BusyStateComponent} from '../busy-state/busy-state.component';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
    public viewInfo : TreeViewInfo;
    public dashboardType : string;
    public inIFrame : boolean;

    constructor(private _userService : UserService, private _globalStateService : GlobalStateService) {
        this.inIFrame = _userService.inIFrame;
    }

    updateViewInfo(viewInfo : TreeViewInfo){
        if(!viewInfo){
            this.viewInfo = viewInfo;
            return;
        }
        else if(viewInfo.dashboardType === DashboardType.none){
            return;
        }

        this.viewInfo = viewInfo;
        this.dashboardType = DashboardType[viewInfo.dashboardType];
     }
}
