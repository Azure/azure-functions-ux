// import {ArmService} from '../../services/arm.service';
// import {ArmObj} from '../armObj';
// import {Site} from '../site';
import {Subject} from 'rxjs/Rx';
// import {SideBarComponent} from '../../components/main/sidebar.component';
import {SideNavComponent} from '../side-nav/side-nav.component';
import {DashboardType} from './models/dashboard-type';
import {TreeViewInfo} from './models/tree-view-info';

export class TreeNode{
    public isExpanded : boolean;
    public showExpandIcon : boolean = true;
    public iconClass : string;
    public isLoading : boolean;
    public children : TreeNode[];
    public title : string;
    public dashboardType : DashboardType;
    public newDashboardType : DashboardType;
    public supportsAdvanced : boolean = false;
    public disabled = false;

    constructor(
        public sideNav : SideNavComponent,
        public resourceId : string,
        public parent : TreeNode){}

    public select(){
        if(!this.resourceId){
            throw "resourceId is not defined";
        }

        if(this.disabled){
            return;
        }

        this.sideNav.updateView(this, this.dashboardType);
        
        if(!this.isExpanded){
            this.toggle(null);
        }
    }

    public toggle(event){
        
        if(!this.isExpanded){
            this.isLoading = true;
            this._loadChildren();
        }
        else{
            this.isExpanded = false;
        }

        if(event){
            event.stopPropagation();
        }

        // this.sideNav.nodeExpanded(this.resourceId);
    }

    public openCreateNew(event){
        this.sideNav.updateView(this, this.newDashboardType);

        // this.sideNav.updateViewInfo(<TreeViewInfo>{
        //     resourceId : this.resourceId,
        //     dashboardType : this.newDashboardType,
        // });
    }

    // Abstract
    protected _loadChildren(){
        this._doneLoading();
    }

    protected _doneLoading(){
        this.isLoading = false;
        this.isExpanded = true;
        this.showExpandIcon = !!this.children && this.children.length > 0;
        if(this.children && this.children.length === 1){
            this.children[0].toggle(null);
        }
    }

    public destroy(){
    }

    public getTreePathNames(){
        let path : string[] = [];
        let curNode : TreeNode = this;
        
        while(curNode){
            path.splice(0, 0, curNode.title);
            curNode = curNode.parent;
        }

        return path;
    }
}

export class RootNode extends TreeNode{
    protected _subscriptionId : string;
    private _firstTimeLoad = true;

    constructor(sideBar : SideNavComponent,
                resourceId : string,
                subscriptionIdStream : Subject<string>){
        super(sideBar, resourceId, null);

        subscriptionIdStream.subscribe(id =>{
            this._subscriptionId = id;

            if(this.isExpanded || this._firstTimeLoad){
                this._firstTimeLoad = false;
                this.isLoading = true;
                this._loadChildren();
            }
        })
    }
}

// export class AdvancedNode extends TreeNode{
//     public dashboardType = DashboardType.advanced;
//     public showExpandIcon = false;

//     constructor(sideBar : SideBarComponent, resourceId : string){
//         super(sideBar, resourceId);
//     }
// }

// export class AdvancedWriteNode extends TreeNode{
//     public dashboardType = DashboardType.advancedWrite;
//     public showExpandIcon = false;

//     constructor(sideBar : SideBarComponent, resourceId : string){
//         super(sideBar, resourceId);
//     }
// }