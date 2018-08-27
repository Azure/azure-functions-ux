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
import { MockDirective } from 'ng-mocks';
import { LoadImageDirective } from '../../controls/load-image/load-image.directive';
import { MockContainerSettingsManager } from './mocks/container-settings-manager.mock';
import { ContainerHostComponent } from './container-host/container-host.component';
import { ContainerImageSourceComponent } from './container-image-source/container-image-source.component';

describe('ContainerSettingsComponent', () => {
    let component: ContainerSettingsComponent;
    let fixture: ComponentFixture<ContainerSettingsComponent>;
    let mockContainerSettingsManager: MockContainerSettingsManager;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    ContainerSettingsComponent,
                    ContainerConfigureComponent,
                    ContainerHostComponent,
                    ContainerImageSourceComponent,
                    MockDirective(LoadImageDirective),
                ],
                imports: [
                    TranslateModule.forRoot()
                ],
                providers: [
                    BroadcastService,
                    Injector,
                    { provide: LogService, useClass: MockLogService },
                    { provide: TelemetryService, useClass: MockTelemetryService },
                    { provide: ContainerSettingsManager, useClass: MockContainerSettingsManager }
                ]
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ContainerSettingsComponent);
        component = fixture.componentInstance;
        mockContainerSettingsManager = TestBed.get(ContainerSettingsManager);

        spyOn(mockContainerSettingsManager, 'resetContainers').and.callThrough();
        spyOn(mockContainerSettingsManager, 'initialize').and.callThrough();
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
        expect(mockContainerSettingsManager.resetContainers).toHaveBeenCalled();
        expect(mockContainerSettingsManager.initialize).toHaveBeenCalledWith(input.data);
        expect(component.selectedContainer).not.toBeNull();
    });
});
