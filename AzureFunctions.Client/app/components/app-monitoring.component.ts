import {Component, OnInit} from '@angular/core';
import {PortalService} from '../services/portal.service';
import {Http, Headers } from '@angular/http';
import {MonitoringService} from '../services/app-monitoring.service';
import {Observable} from 'rxjs/Rx';
import {UsageVolume} from '../models/app-monitoring-usage'
import {nvD3} from 'ng2-nvd3';
import {GlobalStateService} from '../services/global-state.service';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {PortalResources} from '../models/portal-resources';

declare let d3: any;
declare let moment: any;


@Component({
    selector: 'app-monitoring',
    templateUrl: 'templates/app-monitoring.component.html',
    styleUrls: ['styles/app-monitoring.style.css'],
    directives: [nvD3],
    pipes: [TranslatePipe]
})

export class AppMonitoringComponent implements OnInit {
    private numDataPointsForApi: number = 100; // the api for getting the usage data takes a numberBuckets which sets the # of datapoints to return in a date range
    public options: Object;
    public data: Object;
    private consumptionChartData: Array<Object>;

    // for usage chart
    public usageChartOptions: Object;
    public usageChartData: Object;

    // for instanceCounts chart
    public instancesChartOptions: Object;
    public instancesChartData: Object;

    constructor(
        private _monitoringService: MonitoringService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService) { }

    ngOnInit() {
        this._globalStateService.setBusyState();
        var startDate = moment().utc().add(-60, 'days').calendar(); // default currently is today - 60 days
        var endDateTime = moment().utc().add(1, 'days').format(); // current datetime as UTC, current workaround is to pass future date to API to get most recent data
        this._monitoringService.getAppConsumptionData(startDate, endDateTime, this.numDataPointsForApi).subscribe(results => {
            this._globalStateService.clearBusyState();
            this.convertToUsageInfoForChart(results);
        });
    }

    openBlade(name: string) {
        this._portalService.openBlade(name, 'app-monitoring');
    }

    convertToUsageInfoForChart(appUsage: UsageVolume) {
        let xValuesForChart = appUsage.times;
        let yValuesForUsage = appUsage.counts;
        let yValuesForAppCounts = appUsage.instanceCounts;

        // create the x,y points object for the chart
        var usageData = [];
        var appInstancesData = [];
        var todayDateTime = new Date();
        for (var i = 0; i < xValuesForChart.length; i++) {
            var currDateTime = new Date(xValuesForChart[i]);
            if (currDateTime <= todayDateTime) { // workaround for another bug in API where it returns future dates with 0 values
                usageData.push({
                    x: new Date(xValuesForChart[i]),
                    y: yValuesForUsage[i].toFixed(3)
                });

                appInstancesData.push({
                    x: new Date(xValuesForChart[i]),
                    y: yValuesForAppCounts[i]
                })
            }
        }

        this.usageChartOptions = {
            chart: {
                type: 'lineChart',
                height: 450,
                margin: {
                    top: 10,
                    right: 30,
                    bottom: 100,
                    left: 85
                },
                showLegend: true,
                x: function (d) { return d.x; },
                y: function (d) { return d.y; },
                useInteractiveGuideline: true,
                xAxis: {
                    tickFormat: d3.time.format("%b%d %I:%M %p"),
                    ticks: (d3.time.minute, 15), // creates ticks at every 15 minute interval
                    rotateLabels: -35
                },
                xScale: d3.time.scale(),
                noData: this._translateService.instant(PortalResources.appMonitoring_noData),
                yAxis: {
                    axisLabel: this._translateService.instant(PortalResources.appMonitoring_appUsage),
                    tickFormat: (d3.format(".3f"))
                }
            }
        };

        this.usageChartData = [{
            key: this._translateService.instant(PortalResources.appMonitoring_appUsage),
            color: '#2ca02c',
            values: usageData,
           // strokeWidth: 2
        }];

        this.instancesChartOptions = {
            chart: {
                type: 'lineChart',
                height: 450,
                margin: {
                    top: 10,
                    right: 30,
                    bottom: 100,
                    left: 85
                },
                showLegend: true,
                x: function (d) { return d.x; },
                y: function (d) { return d.y; },
                useInteractiveGuideline: true,
                xAxis: {
                    tickFormat: d3.time.format("%b%d %I:%M %p"),
                    ticks: (d3.time.minute, 15), // creates ticks at every 15 minute interval
                    rotateLabels: -35
                },
                xScale: d3.time.scale(),
                noData: this._translateService.instant(PortalResources.appMonitoring_noData),
                yAxis: {
                    axisLabel: this._translateService.instant(PortalResources.appMonitoring_ofExecutions),
                    tickFormat: (d3.format('d'))
                }
            }
        };

        this.instancesChartData = [{
            key: this._translateService.instant(PortalResources.appMonitoring_appExecutions),
            color: '#7777ff',
            values: appInstancesData
        }];
    }
}