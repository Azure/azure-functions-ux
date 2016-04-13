import {Component, OnInit} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {PortalService} from '../services/portal.service';
import {Http, Headers } from 'angular2/http';
import {MonitoringService} from '../services/appMonitoring.service';
import {Observable} from 'rxjs/Rx';
import {MonitoringConsumption} from '../models/appMonitoring-consumption';
import {BroadcastService} from '../services/broadcast.service';
import {BroadcastEvent} from '../models/broadcast-event'
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

    constructor(private _monitoringService: MonitoringService, private _portalService: PortalService, private _broadcastService: BroadcastService) { }

    ngOnInit() {
        this._broadcastService.setBusyState();
        this._monitoringService.getFunctionAppConsumptionData().subscribe(res => {
            this._broadcastService.clearBusyState();
            this.convertToConsumptionChartDataAndDraw(res);
        });
    }

    openBlade(name: string) {
        this._portalService.openBlade(name, 'app-monitoring');
    }

    convertToConsumptionChartDataAndDraw(appConsumption: MonitoringConsumption[]) {
        var monitoringData = []; // monitoringData object that stores the start and end time periods for the container consumption
        var points = []; // saves the [x,y] values for the chart
        // build the consumption data with the start and endtime values for x-axis and the delataY corresponding the active and inactive states of the container
        if (appConsumption.length > 0) {
            for (var i = 0; i < appConsumption.length; i++) {
                monitoringData.push({
                    x: appConsumption[i].startTimeBucket,
                    xDisplay: new Date(appConsumption[i].startTime),
                    deltaY: 1 // container active state
                });
                monitoringData.push({
                    x: appConsumption[i].startTimeBucket + appConsumption[i].length,
                    xDisplay: (new Date(new Date(appConsumption[i].startTime).getTime() + appConsumption[i].length * 60 * 1000)), // convert to local datetime type
                    deltaY: -1 //container inactive state
                });
            }

            monitoringData = monitoringData.sort((i, j) => i.x - j.x);

            var oldY = 0;
            /*
            aggregate logic for monitoring chart data
            1. starting with the first time value (t) in the object and increments of a minute, until end of object array is reached
            2. find the all values in monitoring data object that correspond to that time (t)
            3. build the corresponding y values for the the time (t) and push the values to points object
            */
            for (var t = monitoringData[0].x; t < monitoringData[monitoringData.length - 1].x; t++) {
                var filteredData = monitoringData.filter((d) => d.x == t);
                if (filteredData.length > 0) {
                    var newY = oldY;
                    for (var item of filteredData) {
                        newY = newY + item.deltaY;
                    }
                    var display = filteredData[0].xDisplay;
                    points.push({ x: display, y: oldY });
                    points.push({ x: display, y: newY });
                    oldY = newY;
                }
            }
        }

        this.options = {
            chart: {
                type: 'lineChart',
                height: 450,
                margin: {
                    top: 10,
                    right: 30,
                    bottom: 100,
                    left: 85
                },
                showLegend: false,
                x: function (d) { return d.x; },
                y: function (d) { return d.y; },
                useInteractiveGuideline: true,
                xAxis: {
                    tickFormat: d3.time.format("%b%d %I:%M %p"),
                    ticks: (d3.time.minute, 15), // creates ticks at every 15 minute interval
                    rotateLabels: -35
                },
                xScale: d3.time.scale(),
                showMaxMin: false,
                noData: "There is no Data",
                yAxis: {
                    axisLabel: 'Function App Instances',
                    tickFormat: (d3.format('d')),
                    axisLabelDistance: -10
                },
                color: ['rgb(124, 181, 236)']
            }
        }

        this.data = [
            {
                key: "Units Consumed",
                values: points,
                area: true
            }];
    }
}