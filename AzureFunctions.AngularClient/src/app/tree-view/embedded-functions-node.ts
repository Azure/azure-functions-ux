import { FunctionNode } from './function-node';
import { CdsEntityDescriptor } from './../shared/resourceDescriptors';
import { FunctionsService } from './../shared/services/functions-service';
import { SideNavComponent } from './../side-nav/side-nav.component';
import { PortalResources } from './../shared/models/portal-resources';
import { DashboardType } from './models/dashboard-type';
import { Collection, TreeNode } from './tree-node';

export class EmbeddedFunctionsNode extends TreeNode implements Collection {

    public title = this.sideNav.translateService.instant(PortalResources.functions);
    public dashboardType = DashboardType.FunctionsDashboard;
    private _functionsService: FunctionsService;

    constructor(
        sideNav: SideNavComponent,
        rootNode: TreeNode,
        parentResourceId: string) {
        super(sideNav,
            parentResourceId + '/functions',
            rootNode,
            null);

        this.iconClass = 'tree-node-collection-icon';
        this.iconUrl = 'image/BulletList.svg';
        this.nodeClass += ' collection-node';
        this.showExpandIcon = false;

        this._functionsService = this.sideNav.injector.get(FunctionsService);

        // this.isLoading = true;
        // const descriptor = new CdsEntityDescriptor(this.resourceId);
        // this._functionsService.getAppContext(descriptor.getTrimmedResourceId())
        //     .switchMap(context => {
        //         return this._functionsService.getFunctions(context);
        //     })
        //     .do(fcs => {
        //         // fcs.forEach(f => console.log(f.name));
        //         this.children = fcs.map(fc => {
        //             return new FunctionNode(this.sideNav, fc, this);
        //         });

        //         this.isLoading = false;
        //     }, err => {
        //         // TODO: logging
        //         this.isLoading = false;
        //     })
        //     .subscribe(r => {

        //     });

    }

    public loadChildren() {
        this.isLoading = true;
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
            }, err => {
                // TODO: logging
                this.isLoading = false;
            });
    }
}