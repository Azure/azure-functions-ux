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
import {DropDownComponent} from '../drop-down/drop-down.component';
import {DropDownElement} from '../shared/models/drop-down-element';
import {TreeViewInfo} from '../tree-view/models/tree-view-info';
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
    public subscriptions: DropDownElement<Subscription>[] = [];
    public subscriptionIdObs = new ReplaySubject<string>(1);
    public subscriptionId : string;
    public resourceId : string;

    private _viewInfo : TreeViewInfo;

    constructor(
        public armService : ArmService,
        public cacheService : CacheService,
        public functionsService : FunctionsService,
        public http : Http,
        public globalStateService : GlobalStateService,
        public broadcastService : BroadcastService,
        public translateService : TranslateService,
        public userService : UserService){

        this.treeViewInfoEvent = new EventEmitter<TreeViewInfo>();
        this.rootNode = new TreeNode(this, null);
        this.rootNode.children = [new AppsNode(this, null, this.subscriptionIdObs)];

        this.armService.subscriptions.subscribe(subs =>{
            this.subscriptions = subs.map(e =>({displayLabel: e.displayName, value: e}))
                .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
        })
    }

    updateViewInfo(viewInfo : TreeViewInfo){
        this._viewInfo = viewInfo;
        this.resourceId = viewInfo.resourceId;
        this.treeViewInfoEvent.emit(viewInfo);
    }

    onSubscriptionSelect(subscription: Subscription) {
        this.subscriptionId = subscription.subscriptionId;
        this.subscriptionIdObs.next(this.subscriptionId);
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

}