import { FunctionMonitorComponent } from './../function-monitor.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MockComponent } from 'ng-mocks';
import { MonitorClassicComponent } from './../monitor-classic/monitor-classic.component';
import { MonitorApplicationInsightsComponent } from './../monitor-applicationinsights/monitor-applicationinsights.component';
import { MonitorConfigureComponent } from './../monitor-configure/monitor-configure.component';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ApplicationInsightsService } from './../../shared/services/application-insights.service';
import { TranslateModule } from '@ngx-translate/core';
import { BroadcastService } from './../../shared/services/broadcast.service';
import { TelemetryService } from './../../shared/services/telemetry.service';
import { LogService } from './../../shared/services/log.service';
import { MockLogService } from './../../test/mocks/log.service.mock';
import { MockTelemetryService } from './../../test/mocks/telemetry.service.mock';
import { PortalService } from '../../shared/services/portal.service';
import { MonitorConfigureInfo } from '../../shared/models/function-monitor';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Site } from '../../shared/models/arm/site';
import { FunctionAppContext } from '../../shared/function-app-context';
import { FunctionInfo } from '../../shared/models/function-info';
import { OpenBladeInfo, BladeResult } from '../../shared/models/portal';
import { NullAstVisitor } from '@angular/compiler';

describe('MonitorConfigureComponent', () => {
    let component: MonitorConfigureComponent;
    let fixture: ComponentFixture<MonitorConfigureComponent>;
    let monitorConfigureInfo: MonitorConfigureInfo;

    const functionAppName1 = 'functionApp1';
    const functionName1 = 'functionName1';
    const functionAppResourceId1 = `/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Web/sites/${functionAppName1}`;
    const siteUrl = 'https://functionApp.azurewebsites.net';
    const scmUrl = 'https://functionApp.scm.azurewebsites.net';

    beforeEach(async() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    MonitorConfigureComponent,
                    MockComponent(MonitorClassicComponent),
                    MockComponent(MonitorApplicationInsightsComponent),
                    MockComponent(FunctionMonitorComponent),
                ],
                providers: [
                    { provide: PortalService, useClass: MockPortalService },
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
    });

    beforeEach(() => {
        const site = <ArmObj<Site>>{
            id: functionAppResourceId1,
            kind: 'functionapp',
            location: 'location',
            name: functionAppName1,
            type: 'Microsoft.Web/sites',
            properties: null
        };

        const appContext: FunctionAppContext = {
            mainSiteUrl: siteUrl,
            scmUrl: scmUrl,
            urlTemplates: null,
            site: site
        };

        monitorConfigureInfo = {
            functionMonitorInfo: {
                functionAppContext: appContext,
                functionAppSettings: {},
                functionInfo: <FunctionInfo>{
                    name: functionName1,
                    context: appContext
                },
                appInsightsResourceDescriptor: null
            },
            errorEvent: null
        };
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MonitorConfigureComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    fdescribe('init', () => {

        beforeEach(() => {
            component['setInput'](monitorConfigureInfo);
        });

        it('should create', () => {
            fixture.whenStable().then(() => {
                expect(component).toBeTruthy();
            });
        });

        it('should be off by default', () => {
            fixture.whenStable().then(() => {
                expect(component.allowSwitchToClassic).toBeFalsy();
                expect(component.enableConfigureButton).toBeFalsy();
            });
        });
    });

    @Injectable()
    class MockApplicationInsightsService {
        public setFunctionMonitorClassicViewPreference(functionAppResourceId: string, value: string): void {
        }
    }

    @Injectable()
    class MockPortalService {
        public openBlade(bladeInfo: OpenBladeInfo, source: string): Observable<BladeResult<any>> {
            return Observable.of(null);
        }
    }
});
