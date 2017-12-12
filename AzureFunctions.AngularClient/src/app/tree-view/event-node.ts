import { CdsEntityDescriptor } from './../shared/resourceDescriptors';
import { FunctionNode } from './function-node';
import { FunctionsService } from './../shared/services/functions-service';
import { TreeNode } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { DashboardType } from './models/dashboard-type';

export class EventNode extends TreeNode {
    public title = this._eventName;
    public dashboardType = DashboardType.none;

    private _functionsService: FunctionsService;

    constructor(
        sideNav: SideNavComponent,
        parentNode: TreeNode,
        private _eventName: string) {
        super(sideNav,
            `${parentNode.resourceId}/${_eventName}`,
            parentNode,
            null);

        this._functionsService = sideNav.injector.get(FunctionsService);

        this.iconClass = 'tree-node-events-icon';
        this.iconUrl = 'image/bolt.svg';
        this.nodeClass += ' collection-node';
    }

    public loadChildren() {
        this.isLoading = true;
        // const idMatches = Regex.cdsNamespaceId.exec(this.resourceId);
        const descriptor = new CdsEntityDescriptor(this.resourceId);
        return this._functionsService.getAppContext(descriptor.getTrimmedResourceId())
            .switchMap(context => {
                return this._functionsService.getFunctions(context);
            })
            .do(fcs => {
                // fcs.forEach(f => console.log(f.name));
                this.children = fcs.map(fc => {
                    return new FunctionNode(this.sideNav, fc, this);
                });

                this.isLoading = false;
            }, err =>{
                // TODO: logging
                this.isLoading = false;
            });
    }
}
