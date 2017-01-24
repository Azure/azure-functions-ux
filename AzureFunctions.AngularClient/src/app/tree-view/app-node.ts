import {TreeNode} from './tree-node';
import {DashboardType} from './models/dashboard-type';
import {SideNavComponent} from '../side-nav/side-nav.component';
import {ArmObj} from '../shared/models/arm/arm-obj';
import {Site} from '../shared/models/arm/site';
import {SlotsNode} from './slots-node';
import {FunctionsNode} from './functions-node';

export class AppNode extends TreeNode{
    public supportsAdvanced = true;
    public inAdvancedMode = false;
    public dashboardType = DashboardType.app;
    public disabled = false;
    private _hiddenChildren : TreeNode[];

    constructor(sideBar : SideNavComponent,
                private _siteArmObj : ArmObj<Site>,
                isSearchResult : boolean,
                disabled? : boolean){
        super(sideBar, _siteArmObj.id);

        this.disabled = !!disabled;
        if(disabled){
            this.supportsAdvanced = false;
        }

        this.title = isSearchResult ? `${_siteArmObj.name} (App)` : _siteArmObj.name;
    }

    protected _loadChildren(){
        this.children = [
            new FunctionsNode(this.sideNav, this._siteArmObj),
            new SlotsNode(this.sideNav, this._siteArmObj)
        ];

        this._doneLoading();
    }

    // toggleAdvanced(){
    //     this.isExpanded = true;

    //     let children = this._hiddenChildren;
    //     this._hiddenChildren = this.children;

    //     if(!this.inAdvancedMode){
    //         this.inAdvancedMode = !this.inAdvancedMode;
    //         if(!children || children.length === 0){
    //             children = [new AppConfigNode(this.sideBar, this.resourceId + '/config')];
    //             if(children.length === 1){
    //                 children[0].toggle(null);
    //             }
    //         }
    //     }
    //     else{
    //         this.inAdvancedMode = !this.inAdvancedMode;
    //         if(!children || children.length === 0){
    //             this._loadChildren();
    //             return;
    //         }
    //     }

    //     this.children = children;
    // }
}
