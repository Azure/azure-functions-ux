import {TreeNode} from './tree-node';
import {DashboardType} from './models/dashboard-type';
import {SideNavComponent} from '../side-nav/side-nav.component';
import {ArmObj} from '../shared/models/arm/arm-obj';
import {Site} from '../shared/models/arm/site';

export class SlotNode extends TreeNode{
    public showExpandIcon = false;
    public dashboardType = DashboardType.app;

    constructor(
        sideBar : SideNavComponent,
        slot : ArmObj<Site>,
        parentNode : TreeNode){

        super(sideBar, slot.id, parentNode);
        this.title = slot.name;
    }
}