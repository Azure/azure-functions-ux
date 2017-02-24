import {TreeNode} from './tree-node';
import {DashboardType} from './models/dashboard-type';
import {SideNavComponent} from '../side-nav/side-nav.component';
import {ArmObj} from '../shared/models/arm/arm-obj';
import {Site} from '../shared/models/arm/site';
import {SlotNode} from './slot-node';

export class SlotsNode extends TreeNode{
    public dashboardType = DashboardType.none;
    public title = "Slots";
    
    constructor(sideNav : SideNavComponent, private _siteArmObj : ArmObj<Site>, parentNode : TreeNode){
        super(sideNav, _siteArmObj.id + "/slots", parentNode);
    }
}
