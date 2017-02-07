import { WebsiteId } from './../shared/models/portal';
import { StorageItem } from './../shared/models/localStorage/local-storage';
import { LocalStorageService } from './../shared/services/local-storage.service';
import {Component, OnInit, EventEmitter, OnDestroy, Output} from '@angular/core';
import {Observable, ReplaySubject, Subject} from 'rxjs/Rx';
import {TreeNode} from '../tree-view/tree-node';
import {AppsNode} from '../tree-view/apps-node';
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
    public subscriptionsStream = new ReplaySubject<Subscription[]>(1);
    public selectedSubscriptions : Subscription[] = [];
    public subscriptionsDisplayText = "";
    public resourceId : string;

    private _selectedNode : TreeNode;
    private _savedSubsKey = "/subscriptions/selectedIds";

    constructor(
        public armService : ArmService,
        public cacheService : CacheService,
        public functionsService : FunctionsService,
        public http : Http,
        public globalStateService : GlobalStateService,
        public broadcastService : BroadcastService,
        public translateService : TranslateService,
        public userService : UserService,
        public aiService : AiService){

        this.treeViewInfoEvent = new EventEmitter<TreeViewInfo>();
        this.rootNode = new TreeNode(this, null, null);
        this.rootNode.children = [new AppsNode(this, null, this.subscriptionsStream)];

        let savedSelectedSubscriptionIds : string[] = JSON.parse(localStorage.getItem(this._savedSubsKey));
        if(!savedSelectedSubscriptionIds){
            savedSelectedSubscriptionIds = [];
        }

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

    clearView(){
        this._cleanUp();
        this.treeViewInfoEvent.emit(null);
    }

    private _cleanUp(){
        if(this._selectedNode){
            this._selectedNode.destroy();
        }        
    }

    onSubscriptionsSelect(subscriptions: Subscription[]) {

        let subsString : string;
        if(subscriptions.length === this.subscriptionOptions.length){
            subsString = JSON.stringify([]);
        }
        else{
            subsString = JSON.stringify(subscriptions.map<string>(s => s.subscriptionId));
        }

        localStorage.setItem("/subscriptions/selectedIds", subsString);
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

        // if(this.term.value){
        //     return this.armService.search(this.term.value, this.subscriptionId)
        //         .map<TreeNode[]>(response =>{
        //             return response.json().value.map(armObj =>{
        //                 switch(armObj.type){
        //                     case "Microsoft.Web/sites":
        //                         return new AppNode(this, armObj, true);
        //                     case "Microsoft.Web/sites/slots":
        //                         return new SlotNode(this, armObj, true);
        //                     case "Microsoft.Web/serverFarms":
        //                         return new PlanNode(this, armObj, true);
        //                     case "Microsoft.Web/hostingEnvironments":
        //                         return new EnvironmentNode(this, armObj, true);
        //                     default:
        //                         return new TreeNode(this, armObj.id);
        //                 }
        //             })
        //         }).subscribe(items =>{
        //             this.searchNode.children = <TreeNode[]>items;
        //         });
        // }
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

}