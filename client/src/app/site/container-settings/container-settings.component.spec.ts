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
import { ContainerHostComponent } from './container-host/container-host.component';
import { ContainerImageSourceComponent } from './container-image-source/container-image-source.component';
import { ContainerImageSourceQuickstartComponent } from './container-image-source/container-image-source-quickstart/container-image-source-quickstart.component';
import { ContainerImageSourceACRComponent } from './container-image-source/container-image-source-acr/container-image-source-acr.component';
import { ContainerImageSourceDockerHubComponent } from './container-image-source/container-image-source-dockerhub/container-image-source-dockerhub.component';
import { ContainerImageSourcePrivateRegistryComponent } from './container-image-source/container-image-source-privateregistry/container-image-source-privateregistry.component';
import { RadioSelectorComponent } from '../../radio-selector/radio-selector.component';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgModel } from '@angular/forms';

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
                    ContainerHostComponent,
                    ContainerImageSourceComponent,
                    ContainerImageSourceQuickstartComponent,
                    ContainerImageSourceACRComponent,
                    ContainerImageSourceDockerHubComponent,
                    ContainerImageSourcePrivateRegistryComponent,
                    MockDirective(LoadImageDirective),
                    MockDirective(NgModel),
                    MockComponent(RadioSelectorComponent),
                    MockComponent(NgSelectComponent),
                ],
                imports: [
                    TranslateModule.forRoot()
                ],
                providers: [
                    BroadcastService,
                    Injector,
                    ContainerSettingsManager,
                    { provide: LogService, useClass: MockLogService },
                    { provide: TelemetryService, useClass: MockTelemetryService },
                ]
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

    it('should initialize in Ibiza', () => {

        const input = {
            resourceId: 'resourceId',
            dashboardType: null,
            node: null,
            data: {
                id: 'resourceId',
                data: null,
                containerSettings: component
            },
        };

        component.viewInfoInput = input;
        expect(containerSettingsManager.resetSettings).toHaveBeenCalledWith(input.data);
        expect(containerSettingsManager.initialize).toHaveBeenCalledWith(input.data);
        expect(component.selectedContainer).not.toBeNull();
    });
});
