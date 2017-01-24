// import {SiteManageComponent} from '../../components/site/dashboard/site-manage.component';
import {Observable, Subject} from 'rxjs/Rx';
import {RBACService} from '../shared/services/rbac.service';
import {PortalService} from '../shared/services/portal.service';
import {OpenBladeInfo} from '../shared/models/portal';

export class FeatureItem{
    public title : string;
    public keywords : string;  // Space delimited
    public enabled = true;
    public info : string ;
    public warning : string;
    public isHighlighted : boolean;

    constructor(title : string, keywords : string, info : string){
        this.title = title;
        this.keywords = keywords;
        this.info = info;
    }

    click(){
    }

    load() : Observable<any>{
        return Observable.of(null);
    }
}

export class RBACFeature extends FeatureItem{

    constructor(
        title : string,
        keywords : string,
        info : string,
        private _resourceId : string,
        private _requestedActions : string[],
        private _warning : string,
        private _rbacService : RBACService){
            super(title, keywords, info);

            this.enabled = false;
        }

        public load() : Observable<any>{
            return this._rbacService.hasPermission(this._resourceId, this._requestedActions)
                .flatMap(hasPermission =>{
                    this.enabled = hasPermission;
                    if(!hasPermission){
                        this.warning = this._warning;
                    }
                    return Observable.of(hasPermission);
                });
        }
}

export class RBACBladeFeature extends RBACFeature{
    constructor(
        title : string,
        keywords : string,
        info : string,
        resourceId : string,
        requestedActions : string[],
        warning : string,
        rbacService : RBACService,
        public bladeInfo : OpenBladeInfo,
        private _portalService){

        super(title, keywords, info, resourceId, requestedActions, warning, rbacService);
    }

    click(){
        this._portalService.openBlade(this.bladeInfo, 'site-manage');
    }
}

export class BladeFeature extends FeatureItem{
    constructor(title : string,
                keywords : string,
                info : string,
                public bladeInfo : OpenBladeInfo,
                private _portalService : PortalService){
            super(title, keywords, info);
        }

    click(){
        this._portalService.openBlade(this.bladeInfo, 'site-manage');
    }
}

export class ResourceUriBladeFeature extends BladeFeature{
    constructor(title : string,
                keywords : string,
                info : string,
                public resourceId : string,
                public bladeName : string,
                portalService : PortalService){

        super(title,
              keywords,
              info, <OpenBladeInfo>{
                  detailBlade : bladeName,
                  detailBladeInputs : {
                      resourceUri : resourceId
                  }
              },
              portalService)
    };
}

export class TabFeature extends FeatureItem{
    constructor(
        title : string,
        keywords : string,
        info : string,
        public componentName : string,
        public tabSub : Subject<string>){

        super(title, keywords, info);
    }

    click(){
        this.tabSub.next(this.componentName.toLowerCase());
    }
}