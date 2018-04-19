import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/switchMap';

import { CacheService } from '../../shared/services/cache.service';
import { ArmService } from '../../shared/services/arm.service';
import { Site } from '../../shared/models/arm/site';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { SiteConfig } from '../../shared/models/arm/site-config';
import { Status, Deployment, DeploymentLog } from './deployment';
import { GlobalStateService } from '../../shared/services/global-state.service';

@Component({
    selector: 'deployment-source',
    templateUrl: './deployment-source.component.html',
    styleUrls: ['./deployment-source.component.scss'],
    inputs: ['siteInput']
})

export class DeploymentSourceComponent implements OnDestroy {
    public deployments: Deployment[];
    public deployment: Deployment;
    public logs: DeploymentLog[];
    public loadingDeployments: boolean;
    public loadingLogs: boolean;
    public Status = Status;
    public config: ArmObj<SiteConfig>;
    public site: ArmObj<Site>;

    private _timeoutId: any;
    private _maxRetries = 5;
    private _retries = 0;
    private _siteSubject: Subject<ArmObj<Site>>;

    constructor(private _cacheService: CacheService,
        private _globalStateService: GlobalStateService,
        private _armService: ArmService) {

        this._siteSubject = new Subject<ArmObj<Site>>();

        this._siteSubject
            .distinctUntilChanged()
            .switchMap(site => {
                clearInterval(this._timeoutId);
                this.deployments = [];
                this.site = site;

                this._globalStateService.setBusyState();
                const configId = `${site.id}/config/web`;
                return this._cacheService.getArm(configId);
            })
            .subscribe(r => {
                const config: ArmObj<SiteConfig> = r.json();
                this._globalStateService.clearBusyState();
                this.config = <ArmObj<SiteConfig>>config;

                this.loadingDeployments = true;
                if (config.properties.scmType !== 'None') {
                    this._getDeployments();
                }
            });
    }

    set siteInput(site: ArmObj<Site>) {
        if (!site) {
            return;
        }

        this._siteSubject.next(site);
    }

    expandDeployment(deployment: Deployment) {
        this.deployment = deployment;
        this.logs = [];
        this.loadingLogs = true;
        this._cacheService.get(deployment.log_url)
            .subscribe(result => {
                this.loadingLogs = false;
                this.logs = result.json();
                (<DeploymentLog[]>this.logs).forEach(log => {
                    const date = new Date(log.log_time);
                    log.log_time = this._getTime(date.getHours(), date.getMinutes(), date.getSeconds());
                });
            });
    }

    collapseDeployment() {
        this.deployment = null;
    }

    ngOnDestroy() {
        clearTimeout(this._timeoutId);
    }

    updateConfig(config: ArmObj<SiteConfig>) {
        this.config = config;

        if (config.properties.scmType !== 'None') {
            this.loadingDeployments = true;
            this._getDeployments();
        }
    }

    disconnect() {
        this._globalStateService.setBusyState();
        this._armService.delete(`${this.site.id}/sourceControls/web`)
            .mergeMap(() => {
                return this._cacheService.getArm(`${this.site.id}/config/web`, true);
            })
            .subscribe(r => {
                const config: ArmObj<SiteConfig> = r.json();
                this._globalStateService.clearBusyState();
                this.updateConfig(config);
            });
    }

    private _getDeployments() {
        const sslState = this.site.properties.hostNameSslStates.find(state => {
            return state.hostType === 1;
        });

        const url = `https://${sslState.name}/api/deployments?$orderby=ReceivedTime desc&$top=10`;

        this._cacheService.get(url, true)
            .subscribe(result => {

                const deployments = <Deployment[]>result.json();
                deployments.forEach(deployment => {
                    const date = new Date(deployment.end_time);

                    // TODO: This probably isn't the right way to get a formatted date string, but it works for now.
                    const dateStr = date.toString().slice(0, 15);
                    const timeStr = this._getTime(date.getHours(), date.getMinutes(), date.getSeconds());
                    deployment.end_time = `${dateStr} ${timeStr}`;
                });

                const curDeployments = JSON.stringify(this.deployments);
                const newDeployments = JSON.stringify(deployments);

                if (curDeployments !== newDeployments) {
                    this.deployments = deployments;
                }

                if (this.config.properties.scmType !== 'None') {
                    // Keep the loading icon spinning if keep getting an empty array.
                    // This is because we know that there should be a deployment status
                    // but we're waiting for Kudu to show an initial value
                    if (deployments.length > 0 || this._retries >= this._maxRetries) {
                        this._retries = 0;
                        this.loadingDeployments = false;
                    } else if (deployments.length === 0) {
                        this._retries++;
                    }

                    this._timeoutId = setTimeout(this._getDeployments.bind(this), 5000);
                }
            });
    }

    private _getTime(hours: number, mins: number, secs: number) {
        let h = hours.toString();
        let m = mins.toString();
        let s = secs.toString();
        let ampm = 'AM';

        if (hours > 12) {
            hours = hours - 12;
            ampm = 'PM';
        }

        if (hours < 10) {
            h = '0' + hours;
        }

        if (mins < 10) {
            m = '0' + mins;
        }

        if (secs < 10) {
            s = '0' + secs;
        }

        return `${h}:${m}:${s} ${ampm}`;
    }
}
