import {Component, OnInit} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {PortalService} from '../services/portal.service';
import {Http, Headers } from 'angular2/http';
import {MonitoringService} from '../services/appMonitoring.service';
import {Observable} from 'rxjs/Rx';
import {MonitoringConsumption} from '../models/appMonitoring-consumption';
import {BroadcastEvent, IBroadcastService} from '../services/ibroadcast.service';
import {nvD3} from 'ng2-nvd3';
declare let d3: any;


@Component({
    selector: 'app-monitoring',
    templateUrl: 'templates/app-monitoring.component.html',
    styleUrls: ['styles/app-monitoring.style.css'],
    directives: [nvD3]
})

export class AppMonitoringComponent implements OnInit {
    public options: Object;
    public data: Object;
    private consumptionChartData: Array<Object>;

    constructor(private _monitoringService: MonitoringService, private _portalService: PortalService, private _broadcastService: IBroadcastService) {}

    ngOnInit() {
        this._broadcastService.setBusyState();
        this._monitoringService.getFunctionAppConsumptionData().subscribe(res =>
            {
                this._broadcastService.clearBusyState();
                this.convertToConsumptionChartDataAndDraw(res);
            });
    }

    openBlade(name: string) {
        this._portalService.openBlade(name, 'app-monitoring');
    }

    convertToConsumptionChartDataAndDraw(appConsumption: MonitoringConsumption[]) {
        var consumptionDisplayDates: Array<string>;
        var consumptionLengths: Array<number>;
        this.consumptionChartData = [];
        consumptionDisplayDates = appConsumption.map(e => e.startTime);
        consumptionLengths = appConsumption.map(e => e.length);
        var dates = appConsumption.map(e => e.startTimeBucket);
        var x: number[] = [];
        var deltaY: number[] = [];
        var deltaYSorted: number[] = [];
        var displayDates: Object[] = [];
        for (var i = 0; i < dates.length; i++) {
            x.push(dates[i]);
            deltaY.push(+1);
            // end = start + length
            var end = dates[i] + consumptionLengths[i];
            x.push(end);
            // convert end value from minutes to DateTime
            consumptionDisplayDates.push(new Date(new Date(consumptionDisplayDates[i]).getTime() + end).toISOString());
            deltaY.push(-1);
        }
        // store the unsorted values of array x
        var xArray: number[] = Array.from(x);
        x.sort((a, b) => (a > b ? 1 : a < b ? -1 : 0));

        // update the Y values Array as per the sorted values in x
        for (var i = 0; i < x.length; i++) {
            var index = xArray.indexOf(x[i]);
            deltaYSorted.push(deltaY[index]);
            displayDates.push(new Date(consumptionDisplayDates[index]));
            xArray[index] = -1; // replace the already visited value by -1, to handle duplicates
        }

        var xCategories: number[] = [];
        var y: number[] = [];

        var currX = -1;
        var currY = 0;

        for (var i = 0; i < x.length; i++) {
            if (currX !== x[i]) {
                this.consumptionChartData.push({
                    label: displayDates[i],
                    value: currY
                });
            }
            currX = x[i];
            currY = (currY + deltaYSorted[i]).valueOf();
        }

        this.options = {
            chart: {
                type: 'discreteBarChart',
                height: 450,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 50,
                    left: 55
                },
                x: function (d) { return d.label; },
                y: function (d) { return d.value; },
                //  showValues: true,
                valueFormat: function (d) {
                    return d3.format(',d')(d);
                },
                duration: 0,
                xAxis: {
                    tickFormat: d3.time.format('%c')
                },
                yAxis: {
                    axisLabel: 'Function App Instances',
                    tickFormat: (d3.format('d')),
                    axisLabelDistance: -10
                },
                color: ['rgb(124, 181, 236)'] // give the same color to all bars of the chart
            }
        }

        this.data = [
            {
                key: "Units Consumed",
                values: (this.consumptionChartData)
            }];
    }
}