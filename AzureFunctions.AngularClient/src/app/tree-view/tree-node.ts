import { Disposable } from './tree-node';
import { Subject, Observable } from 'rxjs/Rx';
import {SideNavComponent} from '../side-nav/side-nav.component';
import {DashboardType} from './models/dashboard-type';
import {TreeViewInfo} from './models/tree-view-info';
import {Subscription} from '../shared/models/subscription';

export interface CustomSelection{
    handleSelection();
}

export interface Disposable{
    dispose(newSelectedNode? : TreeNode);
}

export interface Removable{
    remove();
}

export interface Refreshable{
    handleRefresh() : Observable<any>;
}

export interface CanBlockNavChange{
    // Give a node a chance to prevent a user from navigating away
    shouldBlockNavChange() : boolean;
}

export interface Collection{
    loadChildren() : Observable<any>;
}

export interface MutableCollection{
    addChild(child : any);
    removeChild(child : any, callRemoveOnChild? : boolean);
}

export class TreeNode implements Disposable, Removable, CanBlockNavChange, CustomSelection, Collection{
    public isExpanded : boolean;
    public showExpandIcon : boolean = true;
    public iconClass : string;
    public iconUrl : string;
    public isLoading : boolean;
    public children : TreeNode[] = [];
    public title : string;
    public dashboardType : DashboardType;
    public newDashboardType : DashboardType;
    public supportsRefresh = false;
    public supportsAdvanced = false;
    public supportsScope = false;
    public disabled = false;
    public inSelectedTree = false;

    constructor(
        public sideNav : SideNavComponent,
        public resourceId : string,
        public parent : TreeNode){}

    public select(force? : boolean) : void {
        if(this.disabled || !this.resourceId){
            return;
        }

        // Expanding without toggling before updating the view is useful for nodes
        // that do async work.  This way, the arrow is expanded while the node is loading.
        if(!this.isExpanded){
            this.isExpanded = true;
        }

        this.sideNav.updateView(this, this.dashboardType, force)
        .do(null, e =>{
            this.sideNav.aiService.trackException(e, "TreeNode.select()");
        })
        .subscribe(r =>{

            // If updating the view didn't also populate children,
            // then we'll load them manally here.
            if(this.isExpanded && this.children.length === 0){
                this._loadAndExpandChildrenIfSingle();
            }
        });
    }

    // Virtual
    public handleSelection() : Observable<any>{
        this.isLoading = false;
        return Observable.of(null);
    }

    // Virtual
    public refresh(event? : any){
        this.isLoading = true;
        this.handleRefresh()
        .do(null, e =>{
            this.sideNav.aiService.trackException(e, "TreeNode.refresh()");
        })
        .subscribe(r =>{
            if(!r){
                return;
            }

            this.sideNav.updateView(this, this.sideNav.selectedDashboardType)
            .do(null, e=>{
                this.sideNav.aiService.trackException(e, "TreeNode.refresh().updateView()");
            })
            .subscribe(() =>{});            

            this.isLoading = false;
        });

        if(event){
            event.stopPropagation();
        }
    }

    public handleRefresh() : Observable<any>{
        return Observable.of(null);
    }

    public toggle(event){
        
        if(!this.isExpanded){
            this.isLoading = true;
            this.isExpanded = true;

            this._loadAndExpandChildrenIfSingle();
        }
        else{
            this.isExpanded = false;
        }

        if(event){
            event.stopPropagation();
        }
    }

    private _loadAndExpandChildrenIfSingle(){
        this.loadChildren()
        .do(null, e =>{
            this.sideNav.aiService.trackException(e, "TreeNode._loadAndExpandChildrenIfSingle().loadChildren()");
        })
        .subscribe(() =>{
            this.isLoading = false;
            if(this.children && this.children.length > 0){
                let matchingChild = this.children.find(c =>{
                    return this.sideNav.initialResourceId && this.sideNav.initialResourceId.toLowerCase().startsWith(`${this.resourceId}/${c.title}`.toLowerCase());
                })

                if(matchingChild){
                    matchingChild.select();
                }
                else if(this.children.length === 1 && !this.children[0].isExpanded){
                    this.children[0].toggle(null);
                }
                else{
                    this.sideNav.initialResourceId = null;
                }
            }
            else{
                this.sideNav.initialResourceId = null;
            }

            if(this.sideNav.initialResourceId && this.sideNav.initialResourceId.toLowerCase() === this.resourceId.toLowerCase()){
                this.sideNav.initialResourceId = null;
            }
        });
    }

    public openCreateNew(event? : any){
        this.sideNav.updateView(this, this.newDashboardType)
        .do(null, e=>{
            this.sideNav.aiService.trackException(e, "/errors/tree-node/update-view");
        })
        .subscribe(() =>{});
        
        if(event && event.stopPropagation){
            event.stopPropagation();            
        }
    }

    public shouldBlockNavChange() : boolean{
        return false;
    }

    public loadChildren() : Observable<any>{
        return Observable.of(null);
    }

    public dispose(newSelectedNode? : TreeNode){
    }

    public remove(){
    }

    protected _removeHelper(removeIndex : number, callRemoveOnChild? : boolean){
        if(removeIndex > -1){
            let child = this.children[removeIndex];
            this.children.splice(removeIndex, 1);
            
            if(callRemoveOnChild){
                child.remove();
            }

            this.sideNav.clearView(child.resourceId);
        }
    }

    public getTreePathNames(){
        let path : string[] = [];
        let curNode : TreeNode = this;
        
        while(curNode){
            path.splice(0, 0, curNode.title);
            curNode = curNode.parent;
        }

        return path;
    }

    public scopeToNode(){
        this.sideNav.searchExact(this.title);
    }

    protected _addChildAlphabetically(newChild : TreeNode){
        let i : number;
        for(i = 0; i < this.children.length; i++){
            if(newChild.title.toLowerCase() < this.children[i].title.toLowerCase()){
                this.children.splice(i, 0, newChild);
                break;
            }
        }

        if(i === this.children.length){
            this.children.push(newChild);
        }
    }
}