import {Component, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {SideNavComponent} from '../side-nav/side-nav.component';
import {ResourceType, Descriptor, SiteDescriptor} from '../shared/resourceDescriptors';
import {TreeViewInfo} from '../tree-view/models/tree-view-info';
import {DashboardType} from '../tree-view/models/dashboard-type';
import {UserService} from '../shared/services/user.service';
import {GlobalStateService} from '../shared/services/global-state.service';
import {FunctionEditComponent} from '../function-edit/function-edit.component';
// import {SiteDashboardComponent} from '../site/dashboard/site-dashboard.component';
import {BusyStateComponent} from '../busy-state/busy-state.component';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements AfterViewInit {
    public viewInfo : TreeViewInfo;
    public descriptor : Descriptor;
    public dashboardType : string;
    public inIFrame : boolean;

    @ViewChild(BusyStateComponent) busyStateComponent: BusyStateComponent;

    constructor(private _userService : UserService, private _globalStateService : GlobalStateService) {
        this.inIFrame = _userService.inIFrame;
    }

    updateViewInfo(viewInfo : TreeViewInfo){
        if(viewInfo.dashboardType === DashboardType.collection){
            return;
        }

        this.viewInfo = viewInfo;
        this.dashboardType = DashboardType[viewInfo.dashboardType];

        if(viewInfo.dashboardType !== DashboardType.createApp){
            this.descriptor = Descriptor.getDescriptor(viewInfo.resourceId);
        }
     }

    ngAfterViewInit() {
        this._globalStateService.GlobalBusyStateComponent  = this.busyStateComponent;
        // this._globalStateService.LocalDevelopmentInstructionsComponent = this.localDevelopment;
    }
}
