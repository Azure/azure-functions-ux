import { CacheService } from './../shared/services/cache.service';
import { FunctionInfo } from './../shared/models/function-info';
import { FunctionNode } from './function-node';
import { CdsEntityDescriptor } from './../shared/resourceDescriptors';
import { FunctionsService } from './../shared/services/functions-service';
import { SideNavComponent } from './../side-nav/side-nav.component';
import { PortalResources } from './../shared/models/portal-resources';
import { DashboardType } from './models/dashboard-type';
import { Collection, TreeNode, MutableCollection } from './tree-node';

export class EmbeddedFunctionsNode extends TreeNode implements Collection, MutableCollection {

    public title = this.sideNav.translateService.instant(PortalResources.functions);
    public dashboardType = DashboardType.FunctionsDashboard;
    private _cacheService: CacheService;
    private _functionsService: FunctionsService;

    constructor(
        sideNav: SideNavComponent,
        rootNode: TreeNode,
        parentResourceId: string) {
        super(sideNav,
            parentResourceId + '/functions',
            rootNode,
            null);

        this._cacheService = sideNav.injector.get(CacheService);

        this.iconClass = 'tree-node-collection-icon';
        this.iconUrl = 'image/BulletList.svg';
        this.nodeClass += ' collection-node';
        this.showExpandIcon = false;

        this._functionsService = this.sideNav.injector.get(FunctionsService);
    }

    public loadChildren() {
        this.isLoading = true;
        const descriptor = new CdsEntityDescriptor(this.resourceId);
        return this._functionsService.getAppContext(descriptor.getTrimmedResourceId())
            .switchMap(context => {
                return this._functionsService.getFunctions(context);
            })
            .do(fcs => {
                this.children = fcs.map(fc => {
                    return new FunctionNode(this.sideNav, fc, this);
                });

                this.isLoading = false;
            }, err => {
                // TODO: ellhamai - logging
                this.isLoading = false;
            });
    }

    public addChild(functionInfo: FunctionInfo) {
        this._cacheService.clearCachePrefix(functionInfo.context.urlTemplates.functionsUrl);

        const newNode = new FunctionNode(this.sideNav, functionInfo, this);
        this._addChildAlphabetically(newNode);
        newNode.select();
    }

    public removeChild(child: TreeNode) {
        const removeIndex = this.children.findIndex((childNode: TreeNode) => {
            return childNode.resourceId === child.resourceId;
        });

        this._removeHelper(removeIndex, false);
    }
}
