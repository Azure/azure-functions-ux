import { FunctionAppContext } from './../shared/function-app-context';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { Subject } from 'rxjs/Subject';
import { BroadcastService } from 'app/shared/services/broadcast.service';
import { TreeUpdateEvent, BroadcastEvent } from './../shared/models/broadcast-event';
import { CacheService } from './../shared/services/cache.service';
import { FunctionInfo } from './../shared/models/function-info';
import { FunctionNode } from './function-node';
import { CdsEntityDescriptor } from './../shared/resourceDescriptors';
import { SideNavComponent } from './../side-nav/side-nav.component';
import { PortalResources } from './../shared/models/portal-resources';
import { DashboardType } from './models/dashboard-type';
import { Collection, TreeNode, MutableCollection } from './tree-node';
import { Observable } from 'rxjs/Observable';

export class EmbeddedFunctionsNode extends TreeNode implements Collection, MutableCollection {

    public title = this.sideNav.translateService.instant(PortalResources.functions);
    public dashboardType = DashboardType.FunctionsDashboard;
    private _cacheService: CacheService;
    private _functionsService: FunctionAppService;
    private _broadcastService: BroadcastService;
    private _ngUnsubscribe = new Subject();

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

        this._functionsService = this.sideNav.injector.get(FunctionAppService);
        this._broadcastService = sideNav.injector.get(BroadcastService);
    }

    public loadChildren() {
        this.isLoading = true;
        const descriptor = new CdsEntityDescriptor(this.resourceId);
        let context: FunctionAppContext;
        return this._functionsService.getAppContext(descriptor.getTrimmedResourceId())
            .switchMap(context => {
                context = context;
                return this._functionsService.getFunctions(context);
            })
            .do(r => {
                const fcs = r.result;
                this.children = fcs.map(fc => {
                    return new FunctionNode(this.sideNav, context, fc, this);
                });

                this.isLoading = false;
            }, err => {
                // TODO: ellhamai - logging
                this.isLoading = false;
            });
    }

    public addChild(functionInfo: FunctionInfo) {
        this._cacheService.clearCachePrefix(functionInfo.context.urlTemplates.functionsUrl);

        const newNode = new FunctionNode(this.sideNav, functionInfo.context, functionInfo, this);
        this._addChildAlphabetically(newNode);
        newNode.select();
    }

    public removeChild(child: TreeNode) {
        const removeIndex = this.children.findIndex((childNode: TreeNode) => {
            return childNode.resourceId === child.resourceId;
        });

        this._removeHelper(removeIndex, false);
    }

    public handleSelection(): Observable<any> {
        this._broadcastService.getEvents<TreeUpdateEvent>(BroadcastEvent.TreeUpdate)
            .takeUntil(this._ngUnsubscribe)
            .subscribe(event => {

                if (event.operation === 'remove') {
                    const removeIndex = this.children.findIndex((childNode: TreeNode) => {
                        return childNode.resourceId === event.resourceId;
                    });
                    this._removeHelper(removeIndex, false);
                }
            });

        return Observable.of({});
    }

    public handleDeselection(newSelectedNode?: TreeNode) {
        this._ngUnsubscribe.next();
    }
}
