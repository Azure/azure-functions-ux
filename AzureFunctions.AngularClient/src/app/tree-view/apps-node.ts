import { Arm } from './../shared/models/constants';
import { StorageAccount } from './../shared/models/storage-account';
import { Response } from '@angular/http';
import { Subscription } from './../shared/models/subscription';
import { ArmObj, ArmArrayResult } from './../shared/models/arm/arm-obj';
import { TreeNode, MutableCollection, Disposable, Refreshable } from './tree-node';
import { SideNavComponent } from '../side-nav/side-nav.component';
import { Subject, Subscription as RxSubscription, Observable, ReplaySubject } from 'rxjs/Rx';
import { DashboardType } from './models/dashboard-type';
import { Site } from '../shared/models/arm/site';
import { AppNode } from './app-node';
import {BroadcastEvent} from '../shared/models/broadcast-event';
import {ErrorEvent} from '../shared/models/error-event';

export class AppsNode extends TreeNode implements MutableCollection, Disposable, Refreshable {
    public title = "All Function Apps";
    public dashboardType = DashboardType.apps;
    public resourceId = "/apps";
    public childrenStream = new ReplaySubject<AppNode[]>(1);
    public isExpanded = true;
    private _exactAppSearchExp = '\"(.+)\"';

    constructor(
        sideNav: SideNavComponent,
        private _subscriptionsStream : Subject<Subscription[]>,
        private _searchTermStream : Subject<string>,
        private _initialResourceId : string) {  // Should only be used for when the iframe is open on a specific app

        super(sideNav, null, null);

        this.iconClass = "tree-node-apps-icon"
        this.showExpandIcon = false;

        this.childrenStream.subscribe(children =>{
            this.children = children;
        })

        this.childrenStream.next([]);

        let searchStream = this._searchTermStream
        .debounceTime(400)
        .distinctUntilChanged()
        .switchMap((searchTerm) =>{
            return this._subscriptionsStream.distinctUntilChanged()
            .map(subscriptions =>{
                return {
                    searchTerm : searchTerm,
                    subscriptions : subscriptions
                };
            });
        })
        .switchMap(result =>{
            this.childrenStream.next([]);

            if(!result.subscriptions || result.subscriptions.length === 0){
                return Observable.of(null);
            }

            this.isLoading = true;

            return this._doSearch(<AppNode[]>this.children, result.searchTerm, result.subscriptions, 0, null);
        })
        .subscribe((result : { term : string, children : TreeNode[]}) =>{
            if(!result){
                this.isLoading = false;
                return;
            }

            let regex = new RegExp(this._exactAppSearchExp, "i");
            let exactSearchResult = regex.exec(result.term);

            if(exactSearchResult && exactSearchResult.length > 1){
                let filteredChildren = result.children.filter(c =>{
                    if(c.title.toLowerCase() === exactSearchResult[1].toLowerCase()){
                        c.select();
                        return true;
                    }

                    return false;
                })

                // Purposely don't update the stream with the filtered list of children.
                // This is because we only want the exact matching to affect the tree view,
                // not any other listeners.
                this.childrenStream.next(<AppNode[]>result.children);
                this.children = filteredChildren;
            }

            this.isLoading = false;
        });
    }

    public dispose(){
        this._initialResourceId = "";
    }

    private _doSearch(
        children : AppNode[],
        term : string,
        subscriptions : Subscription[],
        subsIndex : number,
        nextLink : string) : Observable<{ term : string, children : TreeNode[]}>{

        let url : string = null;

        let regex = new RegExp(this._exactAppSearchExp, "i");
        let exactSearchResult = regex.exec(term);
        let exactSearch = !!exactSearchResult && exactSearchResult.length > 1;

        let subsBatch = subscriptions.slice(subsIndex, subsIndex + Arm.MaxSubscriptionBatchSize);

        // If the user wants an exact match, then we'll query everything and then filter to that
        // item.  This would be slower for some scenario's where you do an exact search and there
        // is already a filtered list.  But it will be much faster if the full list is already cached.
        if(!term || exactSearch){
            url = this._getArmCacheUrl(subsBatch, nextLink, "Microsoft.Web/sites");
        }
        else{
            url = this._getArmSearchUrl(term, subsBatch, nextLink);
        }

        return this.sideNav.cacheService.get(url)
        .catch(e =>{
            let err = e && e.json && e.json().error;

            if(!err){
                err = { message : "Failed to query for resources."}
            }

            this.sideNav.broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, { message: err.message, details: err.code });
            return Observable.of(null);
        })
        .switchMap<{ term : string, children : TreeNode[]}>(r =>{

            if(!r){
                return Observable.of(r);
            }

            let result : ArmArrayResult = r.json();
            let nodes = result.value
            .filter(armObj =>{
                return armObj.kind === "functionapp";
            })
            .map(armObj =>{
                let newNode = new AppNode(this.sideNav, armObj, this, subscriptions);
                if(newNode.resourceId === this._initialResourceId){
                    newNode.select();
                }

                return newNode;
            })

            children = children.concat(nodes);

            // Only update children if we're not doing an exact match.  For exact matches, we
            // wait until everything is done loading and then show the final result
            if(!exactSearch){
                this.childrenStream.next(children);
            }

            if(result.nextLink || (subsIndex + Arm.MaxSubscriptionBatchSize < subscriptions.length)){
                return this._doSearch(
                    children,
                    term,
                    subscriptions,
                    subsIndex + Arm.MaxSubscriptionBatchSize,
                    result.nextLink);
            }
            else{
                return Observable.of({
                    term : term,
                    children : children,
                });
            }
        })
    }

    public addChild(child : any){
        throw Error("Not implemented yet");
    }

    public removeChild(child : TreeNode, callRemoveOnChild? : boolean){        
        let removeIndex = this.children.findIndex((childNode : TreeNode) =>{
            return childNode.resourceId === child.resourceId;
        })

        this._removeHelper(removeIndex, callRemoveOnChild);
        this.childrenStream.next(<AppNode[]>this.children);
        this.sideNav.cacheService.clearCachePrefix(`${this.sideNav.armService.armUrl}/resources`);
    }

    private _getArmCacheUrl(subs: Subscription[], nextLink : string, type1 : string, type2? : string){
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

            url += `) and (resourceType eq '${type1}'`;

            if(type2){
                url += ` or resourceType eq '${type2}'`;
            }

            url += `)`;
        }

        return url;
    }

    private _getArmSearchUrl(term : string, subs: Subscription[], nextLink : string){
        let url : string;
        if(nextLink){
            url = nextLink;
        }
        else{
            url = `${this.sideNav.armService.armUrl}/resources?api-version=${this.sideNav.armService.armApiVersion}&$filter=(resourceType eq 'microsoft.web/sites') and (`;
            
            for(let i = 0; i < subs.length; i++){
                url += `subscriptionId eq '${subs[i].subscriptionId}'`;
                if(i < subs.length - 1){
                    url += ` or `;
                }
            }

            // let regexResult = this._exactAppSearchExp.exec(term);
            // if(regexResult && regexResult.length > 1){
            //     url += `) and (name eq '${regexResult[1]}')`;
            // }
            // else{
            url += `) and (substringof('${term}', name))`;
            // }
        }

        return url;
    }
}