import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {Observable, Subject, Subscription as RxSubscription} from 'rxjs/Rx';
import {CacheService} from '../../shared/services/cache.service';
import {AuthzService} from '../../shared/services/authz.service';
import {LocalStorageService as StorageService} from '../../shared/services/local-storage.service';
import {Site} from '../../shared/models/arm/site';
import {ArmObj} from '../../shared/models/arm/arm-obj';
import {SiteConfig} from '../../shared/models/arm/site-config';
import {StorageItem} from '../../shared/models/localStorage/local-storage';
import {Availability, AlertItem, AlertIncident, AlertRule, RecommendationItem} from './notifications';
import {AccordionElement} from '../../accordion/accordion-element';
import {AccordionComponent} from '../../accordion/accordion.component';

@Component({
    selector: 'site-notifications',
    templateUrl: './site-notifications.component.html',
    styleUrls: ['./site-notifications.component.scss'],
    inputs: ['siteInput']
})

export class SiteNotificationsComponent {

    public isLoading: boolean = true;

    public isLoadingStatus: boolean = true;
    public status: string;

    public isLoadingAvailability: boolean = true;
    public availability: Availability;

    public isLoadingAlerts: boolean = true;
    public alertItems: AlertItem[] = [];
    public alertDisplayElements: AccordionElement[] = [];
    public alertIncidentsTotal: number = 0;
    public alertLevel : string;
    public hasResourceGroupPermission: boolean = false;

    public isLoadingRecommendations: boolean = true;
    public recommendationItems: ArmObj<RecommendationItem>[] = [];
    public recommendationDisplayElements: AccordionElement[] = [];
    public recommendationLevel : string;

    private _resourceGroupId: string;
    private _site: ArmObj<Site>;
    private _siteSubject = new Subject<ArmObj<Site>>();

    constructor(private _cacheService: CacheService, private _authZService: AuthzService) {
        this._siteSubject = new Subject<ArmObj<Site>>();
        this._siteSubject
            .distinctUntilChanged()
            .switchMap((site: ArmObj<Site>) => {
                this._site = site;

                //reset loading states and clear notifications
                this.isLoading = true;

                this.isLoadingStatus = true;
                this.status = null;

                this.isLoadingAvailability = true;
                this.availability = null;

                this.isLoadingAlerts = true;
                this.alertItems = [];
                this.alertDisplayElements = [];
                this.alertIncidentsTotal = 0;
                this.alertLevel = "none";

                this.isLoadingRecommendations = true;
                this.recommendationItems = [];
                this.recommendationDisplayElements = [];
                this.recommendationLevel = "none";

                //assign status and update "isLoadingStatus"
                this.status = site.properties.state;
                this.isLoadingStatus = false;

                //async calls for availability, alerts, and recommendations
                let availabilityCall = this._cacheService.getArm(site.id + "/providers/Microsoft.ResourceHealth/availabilityStatuses/current", false, "2015-01-01");
                let recommendationsCall = this._cacheService.getArm(site.id + "/recommendations", false, "2015-01-01");

                this._resourceGroupId = site.id.replace(/\/providers\/Microsoft\.Web\/sites.*/gi, "");
                this.hasResourceGroupPermission = false;
                let rbacCall = this._authZService.hasPermission(this._resourceGroupId, [AuthzService.readScope]);

                return Observable.zip(availabilityCall, recommendationsCall, rbacCall)
                 .catch(err =>{
                        return Observable.of([]);
                });
            })
            .flatMap((r: any[]) => {
                this.isLoadingAvailability = false;
                this.isLoadingRecommendations = false;

                if(r.length === 0){
                    return Observable.of([]);
                }

                this.availability = <Availability>r[0].json();

                this.recommendationItems = <ArmObj<RecommendationItem>[]>r[1].json().value;
                this.recommendationDisplayElements = this.recommendationItems
                    .map(i => ({ label: i.properties.message, details: i.properties.message }));

                this._setRecommendationLevel();

                this.hasResourceGroupPermission = r[2];
                if (this.hasResourceGroupPermission) {
                    return this._getAlertRulesFiltered();
                }
                else {
                    return Observable.of([]);
                }
            })
            .flatMap((alertRulesFilteredResults: ArmObj<AlertRule>[]) => {
                if (alertRulesFilteredResults && alertRulesFilteredResults.length > 0) {
                    let alertIncidentsCalls: Observable<any>[] = [];
                    alertRulesFilteredResults.forEach(alertRulesFilteredResult => {
                        alertIncidentsCalls.push(this._getAlertIncidents(alertRulesFilteredResult))
                    });
                    return Observable.zip.apply(null, alertIncidentsCalls);
                }
                else {
                    return Observable.of([]);
                }
            })
            .subscribe((alertItems: AlertItem[]) => {
                alertItems.forEach(a => {
                    if (a.incidents && a.incidents.length > 0) {
                        this.alertIncidentsTotal += a.incidents.length;
                        this.alertItems.push(a);
                    }
                });
                this.alertDisplayElements = this.alertItems
                    .map(i => ({ label: i.properties.name + ' - (Incidents: ' + i.incidents.length + ')', details: i.properties.description }));
                this.isLoadingAlerts = false;

                this.isLoading = false;

                this._setAlertLevel();
            })
    }

    set siteInput(site: ArmObj<Site>) {
        if (!site) {
            return;
        }

        this._siteSubject.next(site);
    }

    private _setAlertLevel(){
        if(this.isLoadingAlerts){
            this.alertLevel = 'none';
        }
        else if(this.alertIncidentsTotal > 0){
            this.alertLevel = 'danger';
        }
        else if(!this.hasResourceGroupPermission){
            this.alertLevel = 'warning';
        }
        else{
            this.alertLevel = 'success';
        }
    }

    private _setRecommendationLevel(){
        if(this.isLoadingRecommendations){
            this.recommendationLevel = 'none';
        }
        else if(this.recommendationItems.length > 0){
            this.recommendationLevel = 'warning';
        }
        else{
            this.recommendationLevel = 'success';
        }
    }

    private _getAlertRulesFiltered() {
        return this._cacheService.getArm(this._resourceGroupId + "/providers/microsoft.insights/alertrules", false, "2016-03-01")
            .map(r => {
                let alertRulesResults: ArmObj<AlertRule>[] = r.json().value;
                let alertRulesResultsFiltered: ArmObj<AlertRule>[] = [];
                alertRulesResults.forEach(alertRuleResult => {
                    if (alertRuleResult.properties.condition && alertRuleResult.properties.condition.dataSource && alertRuleResult.properties.condition.dataSource.resourceUri) {
                        if (alertRuleResult.properties.condition.dataSource.resourceUri.toLowerCase() === this._site.id.toLowerCase()) {
                            alertRulesResultsFiltered.push(alertRuleResult);
                        }
                    }
                });
                return alertRulesResultsFiltered;
            })
    }

    private _getAlertIncidents(alertRule: ArmObj<AlertRule>) {
        return this._cacheService.getArm(alertRule.id + "/incidents", false, "2016-03-01")
            .map(r => {
                let incidentResults: AlertIncident[] = r.json().value;
                let alertItem = <AlertItem>alertRule;
                alertItem.incidents = incidentResults;
                return alertItem;
            })
    }
}