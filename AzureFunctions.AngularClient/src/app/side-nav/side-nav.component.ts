import { LanguageService } from './../shared/services/language.service';
import { Arm } from './../shared/models/constants';
import { SiteDescriptor } from './../shared/resourceDescriptors';
import { PortalService } from './../shared/services/portal.service';
import { ArmArrayResult } from './../shared/models/arm/arm-obj';
import { FormControl } from '@angular/forms';
import { WebsiteId } from './../shared/models/portal';
import { StorageItem, StoredSubscriptions } from './../shared/models/localStorage/local-storage';
import { LocalStorageService } from './../shared/services/local-storage.service';
import { Component, OnInit, EventEmitter, OnDestroy, Output, Input } from '@angular/core';
import {Observable, ReplaySubject, Subject} from 'rxjs/Rx';
import {TreeNode} from '../tree-view/tree-node';
import {AppsNode} from '../tree-view/apps-node';
import {AppNode} from '../tree-view/app-node';
import {TreeViewComponent} from '../tree-view/tree-view.component';
import {ArmService} from '../shared/services/arm.service';
import {CacheService} from '../shared/services/cache.service';
import {UserService} from '../shared/services/user.service';
import {FunctionsService} from '../shared/services/functions.service';
import {GlobalStateService} from '../shared/services/global-state.service';
import {BroadcastService} from '../shared/services/broadcast.service';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {AiService} from '../shared/services/ai.service';
import {DropDownComponent} from '../drop-down/drop-down.component';
import {DropDownElement} from '../shared/models/drop-down-element';
import {TreeViewInfo} from '../tree-view/models/tree-view-info';
import {DashboardType} from '../tree-view/models/dashboard-type';
import {Subscription} from '../shared/models/subscription';
import {Http, Headers, Response, Request} from '@angular/http';

@Component({
  selector: 'side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent{
    @Output() treeViewInfoEvent: EventEmitter<TreeViewInfo>;

    public rootNode : TreeNode;
    public subscriptionOptions: DropDownElement<Subscription>[] = [];
    public selectedSubscriptions : Subscription[] = [];
    public subscriptionsDisplayText = "";
    @Input() public resourceId : string;
    public searchTerm = "";

    private _selectedNode : TreeNode;
    private _savedSubsKey = "/subscriptions/selectedIds";
    private _subscriptionsStream = new ReplaySubject<Subscription[]>(1);
    private _searchTermStream = new Subject<string>();

    constructor(
        public armService : ArmService,
        public cacheService : CacheService,
        public functionsService : FunctionsService,
        public http : Http,
        public globalStateService : GlobalStateService,
        public broadcastService : BroadcastService,
        public translateService : TranslateService,
        public userService : UserService,
        public aiService : AiService,
        public localStorageService : LocalStorageService,
        public portalService : PortalService,
        public languageService : LanguageService){

        this.treeViewInfoEvent = new EventEmitter<TreeViewInfo>();

        userService.getStartupInfo().subscribe(info =>{
            this.resourceId = !!info.resourceId ? info.resourceId : this.resourceId;

            let appsNode = new AppsNode(
                this,
                this._subscriptionsStream,
                this._searchTermStream,
                this.resourceId);

            this.rootNode = new TreeNode(this, null, null);
            this.rootNode.children = [appsNode];

            // Need to allow the appsNode to wire up its subscriptions
            setTimeout(() =>{
                appsNode.select();
            }, 10);


            this._searchTermStream
            .subscribe(term =>{
                this.searchTerm = term;
            })

            // Get the streams in the top-level nodes moving 
            this._searchTermStream.next(""); 

            if(this.subscriptionOptions.length === 0){
                this._setupInitialSubscriptions(info.resourceId);
            }
        });
    }

    updateView(newSelectedNode : TreeNode, dashboardType : DashboardType) : Observable<boolean>{
        if(this._selectedNode){
            if(this._selectedNode !== newSelectedNode){
                if(this._selectedNode.shouldBlockNavChange()){
                    return Observable.of(false);
                }

                this._selectedNode.dispose(newSelectedNode);
            }
        }            

        this._selectedNode = newSelectedNode;
        this.resourceId = newSelectedNode.resourceId;

        let viewInfo = <TreeViewInfo>{
            resourceId : newSelectedNode.resourceId,
            dashboardType : dashboardType,
            node : newSelectedNode
        };

        this.treeViewInfoEvent.emit(viewInfo);

        return newSelectedNode.handleSelection()
        .map(complete =>{
            return true;
        })
    }

    clearView(resourceId : string){
        // We only want to clear the view if the user is currently looking at something
        // under the tree path being deleted
        if(this.resourceId.startsWith(resourceId)){
            this.treeViewInfoEvent.emit(null);
        }
    }

    search(event : any){
        let startPos = event.target.selectionStart;
        let endPos = event.target.selectionEnd;

        // TODO: ellhamai - this is a hack and it's not perfect.  Basically everytime we update
        // the searchTerm, we end up resetting the cursor.  It's better than before, but
        // it's still not great because if the user types really fast, the cursor still moves.
        this._searchTermStream.next(event.target.value);
        
        if(event.target.value.length !== startPos){
            setTimeout(() =>{
                event.target.selectionStart = startPos;
                event.target.selectionEnd = endPos;
            });
        }
    }

    searchExact(term : string){
        this._searchTermStream.next(`app:"${term}"`);
    }

    clearSearch(){
        this._searchTermStream.next("");
    }

    onSubscriptionsSelect(subscriptions: Subscription[]) {

        let subIds : string[];

        if(subscriptions.length === this.subscriptionOptions.length){
            subIds = [];  // Equivalent of all subs
        }
        else{
            subIds = subscriptions.map<string>(s => s.subscriptionId);
        }

        let storedSelectedSubIds : StoredSubscriptions ={
            id : this._savedSubsKey,
            subscriptions : subIds
        }

        this.localStorageService.setItem(storedSelectedSubIds.id, storedSelectedSubIds);
        this.selectedSubscriptions = subscriptions;
        this._subscriptionsStream.next(subscriptions);

        if(subscriptions.length === this.subscriptionOptions.length){
            this._updateSubDisplayText("All subscriptions");
        }
        else if(subscriptions.length > 1){
            this._updateSubDisplayText(`${subscriptions.length} subscriptions`);
        }
        else{
            this._updateSubDisplayText(`${subscriptions[0].displayName}`);
        }
    }

    // The multi-dropdown component has its own default display text values,
    // so we need to make sure we're always overwriting them.  But if we simply
    // set the value to the same value twice, no change notification will happen.
    private _updateSubDisplayText(displayText : string){
        this.subscriptionsDisplayText = "";
        setTimeout(() =>{ 
            this.subscriptionsDisplayText = displayText; 
        }, 10);
    }

    private _setupInitialSubscriptions(resourceId : string){
        let savedSubs = <StoredSubscriptions>this.localStorageService.getItem(this._savedSubsKey);
        let savedSelectedSubscriptionIds = savedSubs ? savedSubs.subscriptions : [];
        let descriptor : SiteDescriptor;

        if(resourceId){
            descriptor = new SiteDescriptor(resourceId);
        }

        // Need to set an initial value to force the tree to render with an initial list first.
        // Otherwise the tree won't load in batches of objects for long lists until the entire
        // observable sequence has completed.
        this._subscriptionsStream.next([]);

        this.armService.subscriptions.subscribe(subs =>{
            let count = 0;

            this.subscriptionOptions =
            subs.map(e =>{
                let subSelected :boolean;

                if(descriptor){
                    subSelected = descriptor.subscription === e.subscriptionId;
                }
                else{
                    // Multi-dropdown defaults to all of none is selected.  So setting it here
                    // helps us figure out whether we need to limit the # of initial subscriptions
                    subSelected =
                        savedSelectedSubscriptionIds.length === 0
                        || savedSelectedSubscriptionIds.findIndex(s => s === e.subscriptionId) > -1;
                }

                if(subSelected){
                    count++;
                }

                return {
                    displayLabel: e.displayName,
                    value: e,
                    isSelected : subSelected && count <= Arm.MaxSubscriptionBatchSize
                };
            })
            .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
        })
    }
}