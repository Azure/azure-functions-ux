import { PortalResources } from './../shared/models/portal-resources';
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
    public isEmpty : boolean;   // Used to reserve blank space when filtering results

    public imageUrl = "images/activity-log.svg";

    constructor(title : string, keywords : string, info : string, imageUrl? : string){
        this.title = title;
        this.keywords = keywords;
        this.info = info;
        this.imageUrl = imageUrl ? imageUrl : this.imageUrl;
    }

    click(){
    }

    load() : Observable<any>{
        return Observable.of(null);
    }
}

export class DisabledDynamicFeature extends FeatureItem{
    constructor(
        title : string,
        keywords : string,
        info : string,
        imageUrl : string,
        sku : string){

        super(title, keywords, info, imageUrl);

        if(sku.toLowerCase() === "dynamic"){
            this.enabled = false;
            this.warning = "This feature is not available for apps that are on a consumption plan";
        }
    }
}

export class DisabledDynamicBladeFeature extends DisabledDynamicFeature{
    constructor(
        title : string,
        keywords : string,
        info : string,
        imageUrl : string,
        sku : string,
        private _bladeInfo : OpenBladeInfo,
        private _portalService : PortalService
    ){
        super(title, keywords, info, imageUrl, sku);
    }

    click(){
        this._portalService.openBlade(this._bladeInfo, 'site-manage');
    }
}

export class RBACFeature extends FeatureItem{

    constructor(
        title : string,
        keywords : string,
        info : string,
        imageUrl : string,
        private _resourceId : string,
        private _requestedActions : string[],
        private _warning : string,
        private _rbacService : RBACService){
            super(title, keywords, info, imageUrl);

            this.enabled = false;
        }

        public load() : Observable<any>{
            return this._rbacService.hasPermission(this._resourceId, this._requestedActions)
                .map(hasPermission =>{
                    this.enabled = hasPermission;
                    if(!hasPermission){
                        this.warning = this._warning;
                    }
                    return hasPermission
                });
        }
}

export class RBACBladeFeature extends RBACFeature{
    constructor(
        title : string,
        keywords : string,
        info : string,
        imageUrl : string,
        resourceId : string,
        requestedActions : string[],
        warning : string,
        rbacService : RBACService,
        public bladeInfo : OpenBladeInfo,
        private _portalService){

        super(title, keywords, info, imageUrl, resourceId, requestedActions, warning, rbacService);
    }

    click(){
        this._portalService.openBlade(this.bladeInfo, 'site-manage');
    }
}

export class BladeFeature extends FeatureItem{
    constructor(title : string,
                keywords : string,
                info : string,
                imageUrl : string,
                public bladeInfo : OpenBladeInfo,
                private _portalService : PortalService){
            super(title, keywords, info, imageUrl);
        }

    click(){
        this._portalService.openBlade(this.bladeInfo, 'site-manage');
    }
}

export class ResourceUriBladeFeature extends BladeFeature{
    constructor(title : string,
                keywords : string,
                info : string,
                imageUrl : string,
                public resourceId : string,
                public bladeName : string,
                portalService : PortalService){

        super(title,
              keywords,
              info,
              imageUrl,
              <OpenBladeInfo>{
                  detailBlade : bladeName,
                  detailBladeInputs : {
                      resourceUri : resourceId
                  }
              },
              portalService)
    };
}

export class OpenBrowserWindowFeature extends FeatureItem{
        constructor(
        title : string,
        keywords : string,
        info : string,
        private _url : string){

        super(title, keywords, info);
    }

    click(){
        window.open(this._url);
    }
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