import { Observable } from 'rxjs/Observable';
import { TreeNode, Collection } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { DashboardType } from './models/dashboard-type';
import { EventNode } from 'app/tree-view/event-node';

export class EventsNode extends TreeNode implements Collection {
    public title = 'Events';
    public dashboardType = DashboardType.none;

    constructor(
        sideNav: SideNavComponent,
        rootNode: TreeNode,
        parentResourceId: string) {
        super(sideNav,
            parentResourceId + '/events',
            rootNode,
            null);

        this.iconClass = 'tree-node-collection-icon';
        this.iconUrl = 'image/BulletList.svg';
        this.nodeClass += ' collection-node';
    }

    public loadChildren() {

        this.children = [new EventNode(this.sideNav, this, 'OnCreate')];
        return Observable.of();
    }
}
