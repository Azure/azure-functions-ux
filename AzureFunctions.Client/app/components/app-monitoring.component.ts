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

    constructor(private _monitoringService: MonitoringService, private _portalService: PortalService, private _broadcastService: IBroadcastService) { }

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
        var data = [];
        for (var i = 0; i < appConsumption.length; i++) {
            data.push({
                x: appConsumption[i].startTimeBucket,
                xDisplay: new Date(appConsumption[i].startTime),
                deltaY: 1
            });
            data.push({
                x: appConsumption[i].startTimeBucket + appConsumption[i].length,
                xDisplay: (new Date(new Date(appConsumption[i].startTime).getTime() + appConsumption[i].length * 60 * 1000)),
                deltaY: -1
            });
        }

        data = data.sort((i, j) => i.x - j.x);
        var points = [];
        var oldY = 0;
        for (var t = data[0].x; t < data[data.length - 1].x; t++) {

            var filteredData = data.filter((d) => d.x == t);
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

        this.options = {
            chart: {
                type: 'lineChart',
                height: 450,
                margin: {
                    top: 10,
                    right: 30,
                    bottom: 60,
                    left: 58
                },
                showLegend: false,
                x: function (d) { return d.x; },
                y: function (d) { return d.y; },
                xAxis: {
                    tickFormat: d3.time.format("%b%d %H:%M"),
                    tickValues: d3.time.hour.range(5), //https://github.com/mbostock/d3/wiki/Time-Intervals
                    rotateLabels: -35
                },
                duration: 500,
                xScale: d3.time.scale(),
                showMaxMin: false
            },
            noData: "There is no Data",
            yAxis: {
                axisLabel: 'Function App Instances',
                tickFormat: (d3.format('d')),
                axisLabelDistance: -10
            },
            color: ['rgb(124, 181, 236)']
        }


        this.data = [
            {
                key: "Units Consumed",
                values: points,
            }];
    }
}