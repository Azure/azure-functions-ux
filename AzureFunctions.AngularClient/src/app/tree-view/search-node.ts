import { AppsNode } from './apps-node';
import { Subscription } from './../shared/models/subscription';
import { ArmObj, ArmArrayResult } from './../shared/models/arm/arm-obj';
import { TreeNode } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { Subject, Subscription as RxSubscription, Observable } from 'rxjs/Rx';
import { DashboardType } from './models/dashboard-type';
import { Site } from '../shared/models/arm/site';
import { AppNode } from './app-node';

export class SearchNode extends TreeNode {
    public title = "Search Results";
    public dashboardType = DashboardType.collection;

    constructor(
        sideNav: SideNavComponent,
        private _searchTermStream : Subject<string>,
        private _subscriptionsStream : Subject<Subscription[]>,
        private _deletedNodeStream : Subject<TreeNode>) {

        super(sideNav, null, null);
            this.children = [];

            this._searchTermStream
            .debounceTime(400)
            .distinctUntilChanged()
            .switchMap((term) =>{
                return this._subscriptionsStream
                .map(subs =>{
                    return { searchTerm : term, subscriptions : subs};
                });
            })
            .switchMap(result =>{

                this.children = [];

                if(!result.searchTerm){
                    return Observable.of(null);
                }

                this.isLoading = true;
                this.isExpanded = true;

                return this._doSearch(result.searchTerm, result.subscriptions, null);
            }).subscribe(() =>{
                this._doneLoading();
            });

            this._deletedNodeStream
            .subscribe(node =>{
                this._removeChild(node);
            })
    }
    
    private _removeChild(child : TreeNode){        
        let removeIndex = this.children.findIndex((childNode : TreeNode) =>{
            return childNode.resourceId === child.resourceId;
        })

        this._removeHelper(removeIndex, false);
        this.sideNav.cacheService.clearCachePrefix(`${this.sideNav.armService.armUrl}/resources`);
    }

    private _doSearch(term : string, subscriptions : Subscription[], nextLink : string){
        let url = this._getArmSearchUrl(term, subscriptions, nextLink);
        return this.sideNav.cacheService.get(url)
        .switchMap<ArmArrayResult>(r =>{
            let result : ArmArrayResult = r.json();
            let nodes = result.value
            .filter(armObj =>{
                return armObj.kind === "functionapp";
            })
            .map(armObj =>{
                return new AppNode(this.sideNav, armObj, true, this);                
            })

            this.children = this.children.concat(nodes);

            if(result.nextLink){
                return this._doSearch(term, subscriptions, result.nextLink);
            }
            else{
                return Observable.of(null);
            }
        })
    }

    private _getArmSearchUrl(term : string, subs: Subscription[], nextLink : string){
        let url : string;
        if(nextLink){
            url = nextLink;
        }
        else{
            url = `${this.sideNav.armService.armUrl}/resources?api-version=${this.sideNav.armService.armApiVersion}&$filter=(`;
            
            for(let i = 0; i < subs.length; i++){
                url += `subscriptionId eq '${subs[i].subscriptionId}'`;
                if(i < subs.length - 1){
                    url += ` or `;
                }
            }

            url += `) and (substringof('${term}', name)) and (resourceType eq 'microsoft.web/sites')`;
        }

        return url;
    }
}