import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TranslateModule } from '@ngx-translate/core';
import { BroadcastService } from './../../shared/services/broadcast.service';
import { TelemetryService } from './../../shared/services/telemetry.service';
import { LogService } from './../../shared/services/log.service';
import { MockLogService } from './../../test/mocks/log.service.mock';
import { MockTelemetryService } from './../../test/mocks/telemetry.service.mock';
import { PortalService } from '../../shared/services/portal.service';
import { FunctionMonitorInfo } from '../../shared/models/function-monitor';
import { FunctionAppContext } from '../../shared/function-app-context';
import { FunctionInfo } from '../../shared/models/function-info';
import { OpenBladeInfo, BladeResult } from '../../shared/models/portal';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Site } from '../../shared/models/arm/site';
import { CommandBarComponent } from '../../controls/command-bar/command-bar.component';
import { CommandComponent } from '../../controls/command-bar/command/command.component';
import { MonitorApplicationInsightsComponent } from './monitor-applicationinsights.component';
import { ApplicationInsightsService } from '../../shared/services/application-insights.service';
import { ARMApplicationInsightsDescriptior } from '../../shared/resourceDescriptors';
import { SidebarModule } from 'ng-sidebar';
import { TblComponent } from '../../controls/tbl/tbl.component';
import { TblThComponent } from '../../controls/tbl/tbl-th/tbl-th.component';
import { MonitorDetailsComponent } from '../monitor-details/monitor-details.component';
import { AIMonthlySummary, AIInvocationTrace } from '../../shared/models/application-insights';

describe('MonitorApplicationinsightsComponent', () => {
    let component: MonitorApplicationInsightsComponent;
    let fixture: ComponentFixture<MonitorApplicationInsightsComponent>;
    let functionMonitorInfo: FunctionMonitorInfo;

    const functionAppName = 'functionApp';
    const functionName1 = 'function';
    const functionAppResourceId1 = '/subscriptions/sub/resourceGroups/rg1/providers/Microsoft.Web/sites/functionApp';
    const applicationInsightsResourceId = '/subscriptions/sub/resourceGroups/rg2/providers/Microsoft.Insights/components/functionAppAI';
    const siteUrl = 'https://functionApp.azurewebsites.net';
    const scmUrl = 'https://functionApp.scm.azurewebsites.net';

    beforeEach(async() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    MonitorApplicationInsightsComponent,
                    MockComponent(CommandBarComponent),
                    MockComponent(CommandComponent),
                    MockComponent(TblComponent),
                    MockComponent(TblThComponent),
                    MockComponent(MonitorDetailsComponent)
                ],
                providers: [
                    { provide: PortalService, useClass: MockPortalService },
                    { provide: ApplicationInsightsService, useClass: MockApplicationInsightsService },
                    { provide: TelemetryService, useClass: MockTelemetryService },
                    { provide: LogService, useClass: MockLogService },
                    BroadcastService,
                ],
                imports: [
                    SidebarModule.forRoot(),
                    TranslateModule.forRoot()
                ]
            })
            .compileComponents();
    });

    beforeEach(() => {
        const site = <ArmObj<Site>>{
            id: functionAppResourceId1,
            kind: 'functionapp',
            location: 'location',
            name: functionAppName,
            type: 'Microsoft.Web/sites',
            properties: null
        };

        const appContext: FunctionAppContext = {
            mainSiteUrl: siteUrl,
            scmUrl: scmUrl,
            urlTemplates: null,
            site: site
        };

        functionMonitorInfo = {
            functionAppContext: appContext,
            functionAppSettings: {},
            functionInfo: <FunctionInfo>{
                name: functionName1,
                context: appContext
            },
            appInsightsResourceDescriptor: new ARMApplicationInsightsDescriptior(applicationInsightsResourceId),
            appInsightsFeatureEnabled: true
        };
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MonitorApplicationInsightsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('init', () => {

        beforeEach(() => {
            component['setInput'](functionMonitorInfo);
        });

        it('should create', () => {
            fixture.whenStable().then(() => {
                expect(component).toBeTruthy();
            });
        });

        it('should on data load', () => {
            fixture.whenStable().then(() => {
                expect(component.sidePanelOpened).toBeFalsy();
                expect(component.applicationInsightsInstanceName).toEqual('functionAppAI');
                expect(component.successCount).toEqual('1');
                expect(component.errorsCount).toEqual('2');
                expect(component.invocationTraces.length).toEqual(3);
            });
        });
    });

    @Injectable()
    class MockApplicationInsightsService {
        public getLast30DaysSummary(aiResourceId: string, functionName: string): Observable<AIMonthlySummary> {
            return Observable.of({
                successCount: 1,
                failedCount: 2
            });
        }

        public getInvocationTraces(aiResourceId: string, functionName: string, top: number = 20): Observable<AIInvocationTrace[]> {
            return Observable.of([{
                'timestamp': '2018-04-28T01:01:01.509Z',
                'timestampFriendly': '2018-04-28 01:01:01.509',
                'id': 'b6401cf9-16b9-4ecd-ac9f-432b71e433ba',
                'name': 'HttpTriggerCSharp1',
                'success': 'True',
                'resultCode': '200',
                'duration': 1.8933,
                'operationId': 'b6401cf9-16b9-4ecd-ac9f-432b71e433ba'
            }, {
                'timestamp': '2018-04-28T01:01:10.509Z',
                'timestampFriendly': '2018-04-28 01:01:10.509',
                'id': 'b6401cf9-16b9-4ecd-ac9f-432b71e433bb',
                'name': 'HttpTriggerCSharp1',
                'success': 'False',
                'resultCode': '500',
                'duration': 1.8933,
                'operationId': 'b6401cf9-16b9-4ecd-ac9f-432b71e433bb'
            }, {
                'timestamp': '2018-04-28T01:01:21.509Z',
                'timestampFriendly': '2018-04-28 01:01:21.509',
                'id': 'b6401cf9-16b9-4ecd-ac9f-432b71e433bc',
                'name': 'HttpTriggerCSharp1',
                'success': 'False',
                'resultCode': '500',
                'duration': 1.8933,
                'operationId': 'b6401cf9-16b9-4ecd-ac9f-432b71e433bc'
            }]);
        }
    }

    @Injectable()
    class MockPortalService {
        public openBlade(bladeInfo: OpenBladeInfo, source: string): Observable<BladeResult<any>> {
            return Observable.of(null);
        }
    }
});
