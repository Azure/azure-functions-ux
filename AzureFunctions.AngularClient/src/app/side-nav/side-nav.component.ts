import { ArmArrayResult } from './../shared/models/arm/arm-obj';
import { FormControl } from '@angular/forms';
import { WebsiteId } from './../shared/models/portal';
import { StorageItem, StoredSubscriptions } from './../shared/models/localStorage/local-storage';
import { LocalStorageService } from './../shared/services/local-storage.service';
import {Component, OnInit, EventEmitter, OnDestroy, Output} from '@angular/core';
import {Observable, ReplaySubject, Subject} from 'rxjs/Rx';
import {TreeNode} from '../tree-view/tree-node';
import {AppsNode} from '../tree-view/apps-node';
import {AppNode} from '../tree-view/app-node';
import {SearchNode} from '../tree-view/search-node';
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
    public searchNode : TreeNode;
    public subscriptionOptions: DropDownElement<Subscription>[] = [];
    public subscriptionsStream = new ReplaySubject<Subscription[]>(1);
    public selectedSubscriptions : Subscription[] = [];
    public subscriptionsDisplayText = "";
    public resourceId : string;
    public searchTerm = "";
    public deletedNodeStream = new Subject<TreeNode>();

    private _selectedNode : TreeNode;
    private _savedSubsKey = "/subscriptions/selectedIds";
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
        public localStorageService : LocalStorageService){

        this.treeViewInfoEvent = new EventEmitter<TreeViewInfo>();

        this.rootNode = new TreeNode(this, null, null);
        this.rootNode.children = [
            new AppsNode(
                this,
                this.subscriptionsStream,
                this.deletedNodeStream)];

        this.searchNode = new TreeNode(this, null, null);
        this.searchNode.children = [
            new SearchNode(
                this,
                this._searchTermStream,
                this.subscriptionsStream,
                this.deletedNodeStream)
        ];

        this._setupInitialSubscriptions();
    }

    updateView(newSelectedNode : TreeNode, dashboardType : DashboardType){
        this._cleanUp();

        this._selectedNode = newSelectedNode;

        this.resourceId = newSelectedNode.resourceId;

        let viewInfo = <TreeViewInfo>{
            resourceId : newSelectedNode.resourceId,
            dashboardType : dashboardType,
            node : newSelectedNode
        };

        this.treeViewInfoEvent.emit(viewInfo);
    }

    clearView(resourceId : string){
        // We only want to clear the view if the user is currently looking at something
        // under the tree path being deleted
        if(this.resourceId.startsWith(resourceId)){
            this.treeViewInfoEvent.emit(null);
        }
    }

    search(event : any){
        this.searchTerm = event.target.value;
        this._searchTermStream.next(event.target.value);
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
        this.subscriptionsStream.next(subscriptions);

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

    private _cleanUp(){
        if(this._selectedNode){
            this._selectedNode.dispose();
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

    private _setupInitialSubscriptions(){
        let savedSubs = <StoredSubscriptions>this.localStorageService.getItem(this._savedSubsKey);
        let savedSelectedSubscriptionIds = savedSubs ? savedSubs.subscriptions : [];

        // Need to set an initial value to force the tree to render with an initial list first.
        // Otherwise the tree won't load in batches of objects for long lists until the entire
        // observable sequence has completed.
        this.subscriptionsStream.next([]);

        this.armService.subscriptions.subscribe(subs =>{
            this.subscriptionOptions =
            subs.map(e =>{
                let selectedSub = savedSelectedSubscriptionIds.find(s => s === e.subscriptionId);

                return {
                    displayLabel: e.displayName,
                    value: e,
                    isSelected : !!selectedSub
                };
            })
            .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
        })
    }
}