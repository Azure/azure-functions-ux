import { FunctionMonitorComponent } from './function-monitor.component';
import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';
import { MonitorClassicComponent } from './monitor-classic/monitor-classic.component';
import { MonitorApplicationInsightsComponent } from './monitor-applicationinsights/monitor-applicationinsights.component';
import { MonitorConfigureComponent } from './monitor-configure/monitor-configure.component';
import { FunctionAppService } from '../shared/services/function-app.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { FunctionAppContext } from '../shared/function-app-context';
import { ScenarioCheckInput, ScenarioCheckResult } from '../shared/services/scenario/scenario.models';
import { ScenarioService } from '../shared/services/scenario/scenario.service';
import { ApplicationInsightsService } from '../shared/services/application-insights.service';
import { TranslateModule } from '@ngx-translate/core';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { BroadcastService } from '../shared/services/broadcast.service';
import { TelemetryService } from '../shared/services/telemetry.service';
import { LogService } from '../shared/services/log.service';
import { Site } from '../shared/models/arm/site';
import { ArmObj } from '../shared/models/arm/arm-obj';
import { HttpResult } from '../shared/models/http-result';
import { FunctionInfo } from '../shared/models/function-info';
import { MockLogService } from '../test/mocks/log.service.mock';
import { MockTelemetryService } from '../test/mocks/telemetry.service.mock';
import { DashboardType } from '../tree-view/models/dashboard-type';
import { ARMApplicationInsightsDescriptior } from '../shared/resourceDescriptors';
import { errorIds } from '../shared/models/error-ids';

describe('FunctionMonitorComponent', () => {
    let component: FunctionMonitorComponent;
    let fixture: ComponentFixture<FunctionMonitorComponent>;

    const functionAppName = 'functionApp';
    const functionName1 = 'function1';
    const functionAppResourceId1 = '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Web/sites/functionApp1';
    const functionAppResourceId2 = '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Web/sites/functionApp2';
    const functionAppResourceId3 = '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Web/sites/functionApp3';
    const functionAppResourceId4 = '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Web/sites/functionApp4';
    const functionAppResourceId5 = '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Web/sites/functionApp5';
    const appInsightsResourceId = '/subscriptions/sub/resourceGroups/rg/providers/Microsoft.AppInsights/components/functionApp4';
    const functionResourceId1 = `${functionAppResourceId1}/functions/${functionName1}`;
    const functionResourceId2 = `${functionAppResourceId2}/functions/${functionName1}`;
    const functionResourceId3 = `${functionAppResourceId3}/functions/${functionName1}`;
    const functionResourceId4 = `${functionAppResourceId4}/functions/${functionName1}`;
    const functionResourceId5 = `${functionAppResourceId5}/functions/${functionName1}`;
    const siteUrl = 'https://functionApp.azurewebsites.net';
    const scmUrl = 'https://functionApp.scm.azurewebsites.net';

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    FunctionMonitorComponent,
                    MockComponent(MonitorClassicComponent),
                    MockComponent(MonitorApplicationInsightsComponent),
                    MockComponent(MonitorConfigureComponent),
                ],
                providers: [
                    { provide: FunctionAppService, useClass: MockFunctionAppService },
                    { provide: ScenarioService, useClass: MockScenarioService },
                    { provide: ApplicationInsightsService, useClass: MockApplicationInsightsService },
                    BroadcastService,
                    { provide: TelemetryService, useClass: MockTelemetryService },
                    { provide: LogService, useClass: MockLogService },
                ],
                imports: [
                    TranslateModule.forRoot()
                ]
            })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FunctionMonitorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('init', () => {

        beforeEach(() => {
            TestBed
                .get(BroadcastService)
                .broadcastEvent(BroadcastEvent.TreeNavigation, {resourceId: functionResourceId1, dashboardType: DashboardType.FunctionMonitorDashboard});
        });

        it('should create', () => {
            fixture.whenStable().then(() => {
                expect(component).toBeTruthy();
            });
        });

        it('should be off by default', () => {
            fixture.whenStable().then(() => {
                expect(component.shouldRenderMonitorApplicationInsights).toBeFalsy();
                expect(component.shouldRenderMonitorClassic).toBeFalsy();
                expect(component.shouldRenderMonitorConfigure).toBeFalsy();
            });
        });
    });

    describe('validate views', () => {

        it('should classic view', fakeAsync(() => {
            TestBed
                .get(BroadcastService)
                .broadcastEvent(BroadcastEvent.TreeNavigation, {resourceId: functionResourceId2, dashboardType: DashboardType.FunctionMonitorDashboard});

            fixture.whenStable().then(() => {
                expect(component.shouldRenderMonitorApplicationInsights).toBeFalsy();
                expect(component.shouldRenderMonitorClassic).toBeTruthy();
                expect(component.shouldRenderMonitorConfigure).toBeFalsy();
            });
        }));

        it('should load configure view', fakeAsync(() => {
            TestBed
                .get(BroadcastService)
                .broadcastEvent(BroadcastEvent.TreeNavigation, {resourceId: functionResourceId3, dashboardType: DashboardType.FunctionMonitorDashboard});

            fixture.whenStable().then(() => {
                expect(component.shouldRenderMonitorApplicationInsights).toBeFalsy();
                expect(component.shouldRenderMonitorClassic).toBeFalsy();
                expect(component.shouldRenderMonitorConfigure).toBeTruthy();
            });
        }));

        it('should load application insights view', fakeAsync(() => {
            TestBed
                .get(BroadcastService)
                .broadcastEvent(BroadcastEvent.TreeNavigation, {resourceId: functionResourceId4, dashboardType: DashboardType.FunctionMonitorDashboard});

            fixture.whenStable().then(() => {
                expect(component.shouldRenderMonitorApplicationInsights).toBeTruthy();
                expect(component.shouldRenderMonitorClassic).toBeFalsy();
                expect(component.shouldRenderMonitorConfigure).toBeFalsy();
            });
        }));

        it('should load configure view due to app insights key mismatch', fakeAsync(() => {
            TestBed
                .get(BroadcastService)
                .broadcastEvent(BroadcastEvent.TreeNavigation, {resourceId: functionResourceId5, dashboardType: DashboardType.FunctionMonitorDashboard});

            fixture.whenStable().then(() => {
                expect(component.shouldRenderMonitorApplicationInsights).toBeFalsy();
                expect(component.shouldRenderMonitorClassic).toBeFalsy();
                expect(component.shouldRenderMonitorConfigure).toBeTruthy();
                expect(component.monitorConfigureInfo).not.toBeNull();
                expect(component.monitorConfigureInfo).not.toBeUndefined();
                expect(component.monitorConfigureInfo.errorEvent).not.toBeNull();
                expect(component.monitorConfigureInfo.errorEvent).not.toBeUndefined();
                expect(component.monitorConfigureInfo.errorEvent.errorId).toEqual(errorIds.applicationInsightsInstrumentationKeyMismatch);
            });
        }));
    });

    @Injectable()
    class MockFunctionAppService {
        getAppContext(resourceId: string): Observable<FunctionAppContext> {
            const site = <ArmObj<Site>>{
                id: resourceId,
                kind: 'functionapp',
                location: 'location',
                name: functionAppName,
                type: 'Microsoft.Web/sites',
                properties: null
            };

            return Observable.of(<FunctionAppContext>{
                mainSiteUrl: siteUrl,
                scmUrl: scmUrl,
                urlTemplates: null,
                site: site
            });
        }

        getFunction(context: FunctionAppContext, name: string): Observable<HttpResult<FunctionInfo>> {
            const httpResult = <HttpResult<FunctionInfo>>{
                isSuccessful: true,
                error: null,
                result: <FunctionInfo>{
                    name: functionName1,
                    context: context
                }
            };

            return Observable.of(httpResult);
        }

        getFunctionAppAzureAppSettings(context: FunctionAppContext): Observable<HttpResult<ArmObj<{ [key: string]: string }>>> {
            const properties: { [key: string]: string } = {};

            if (context.site.id === functionAppResourceId4 || context.site.id === functionAppResourceId5) {
                properties['APPINSIGHTS_INSTRUMENTATIONKEY'] = 'key1';
            }

            const armObj: ArmObj<{ [key: string]: string }> = {
                id: context.site.id,
                kind: 'functionapp',
                location: 'location',
                name: functionAppName,
                type: 'Microsoft.Web/sites',
                properties: properties
            };

            const httpResult: HttpResult<ArmObj<{ [key: string]: string }>> = {
                isSuccessful: true,
                error: null,
                result: armObj
            };

            return Observable.of(httpResult);
        }
    }

    @Injectable()
    class MockScenarioService {
        public checkScenarioAsync(id: string, input?: ScenarioCheckInput): Observable<ScenarioCheckResult> {
            let armAppInsightsDescriptor: ARMApplicationInsightsDescriptior = null;

            if (input.site.id === functionAppResourceId4) {
                armAppInsightsDescriptor = new ARMApplicationInsightsDescriptior(appInsightsResourceId);
            }

            return Observable.of(<ScenarioCheckResult>{
                status: 'enabled',
                data: armAppInsightsDescriptor,
                environmentName: 'prod',
                id: id
            });
        }
    }

    @Injectable()
    class MockApplicationInsightsService {
        public getFunctionMonitorClassicViewPreference(functionAppResourceId: string): string {
            if (functionAppResourceId === functionAppResourceId2) {
                return 'classic';
            }

            return null;
        }

        public removeFunctionMonitorClassicViewPreference(functionAppResourceId: string): void {
        }
    }

});
