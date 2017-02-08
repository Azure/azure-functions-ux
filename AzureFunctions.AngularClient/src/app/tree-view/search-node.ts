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
        private _subscriptionsStream : Subject<Subscription[]>) {

        super(sideNav, null, null);

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
    }

    private _doSearch(term : string, subscriptions : Subscription[], nextLink : string){
        return this.sideNav.armService.search(term, subscriptions, nextLink)
        .switchMap<ArmArrayResult>((result : ArmArrayResult) =>{
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
}