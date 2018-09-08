import { ContainerSettingsComponent } from './container-settings.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { LogService } from '../../shared/services/log.service';
import { MockLogService } from '../../test/mocks/log.service.mock';
import { TelemetryService } from '../../shared/services/telemetry.service';
import { MockTelemetryService } from '../../test/mocks/telemetry.service.mock';
import { ContainerSettingsManager } from './container-settings-manager';
import { Injector } from '@angular/core';
import { ContainerConfigureComponent } from './container-configure/container-configure.component';
import { MockDirective, MockComponent } from 'ng-mocks';
import { LoadImageDirective } from '../../controls/load-image/load-image.directive';
import { ContainerImageSourceComponent } from './container-image-source/container-image-source.component';
import { ContainerImageSourceQuickstartComponent } from './container-image-source/container-image-source-quickstart/container-image-source-quickstart.component';
import { ContainerImageSourceACRComponent } from './container-image-source/container-image-source-acr/container-image-source-acr.component';
import { ContainerImageSourceDockerHubComponent } from './container-image-source/container-image-source-dockerhub/container-image-source-dockerhub.component';
import { ContainerImageSourcePrivateRegistryComponent } from './container-image-source/container-image-source-privateregistry/container-image-source-privateregistry.component';
import { RadioSelectorComponent } from '../../radio-selector/radio-selector.component';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgModel } from '@angular/forms';
import { ContainerLogsComponent } from './container-image-source/container-logs/container-logs.component';
import { ContainerMultiConfigComponent } from './container-image-source/container-multiconfig/container-multiconfig.component';
import { ContainerContinuousDeliveryComponent } from './container-image-source/container-continuous-delivery/container-continuos-delivery.component';
import { InfoBoxComponent } from '../../controls/info-box/info-box.component';
import { TextboxComponent } from '../../controls/textbox/textbox.component';
import { TreeViewInfo } from '../../tree-view/models/tree-view-info';
import { ContainerSettingsInput, ContainerSettingsData } from './container-settings';

describe('ContainerSettingsComponent', () => {
    let component: ContainerSettingsComponent;
    let fixture: ComponentFixture<ContainerSettingsComponent>;
    let containerSettingsManager: ContainerSettingsManager;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    ContainerSettingsComponent,
                    ContainerConfigureComponent,
                    ContainerImageSourceComponent,
                    ContainerImageSourceQuickstartComponent,
                    ContainerImageSourceACRComponent,
                    ContainerImageSourceDockerHubComponent,
                    ContainerImageSourcePrivateRegistryComponent,
                    ContainerLogsComponent,
                    ContainerMultiConfigComponent,
                    ContainerContinuousDeliveryComponent,
                    MockDirective(LoadImageDirective),
                    MockDirective(NgModel),
                    MockComponent(RadioSelectorComponent),
                    MockComponent(NgSelectComponent),
                    MockComponent(InfoBoxComponent),
                    MockComponent(TextboxComponent),
                ],
                imports: [
                    TranslateModule.forRoot(),
                ],
                providers: [
                    BroadcastService,
                    Injector,
                    ContainerSettingsManager,
                    { provide: LogService, useClass: MockLogService },
                    { provide: TelemetryService, useClass: MockTelemetryService },
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ContainerSettingsComponent);
        component = fixture.componentInstance;
        containerSettingsManager = TestBed.get(ContainerSettingsManager);

        spyOn(containerSettingsManager, 'resetSettings').and.callThrough();
        spyOn(containerSettingsManager, 'initialize').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should initialize from ibiza creates for web app', () => {

        const input: TreeViewInfo<ContainerSettingsInput<ContainerSettingsData>> = {
            resourceId: '/subscriptions/1234',
            dashboardType: null,
            node: null,
            data: {
                id: '/subscriptions/1234',
                data: {
                    resourceId: '/subscriptions/1234',
                    isFunctionApp: false,
                    subscriptionId: '1234',
                    location: '',
                    os: 'linux',
                    fromMenu: false,
                },
                containerSettings: component,
            },
        };

        component.viewInfoInput = input;
        expect(containerSettingsManager.resetSettings).toHaveBeenCalledWith(input.data);
        expect(containerSettingsManager.initialize).toHaveBeenCalledWith(input.data);
        expect(component.selectedContainer).not.toBeNull();
    });
});
