import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockDirective, MockComponent } from 'ng-mocks';
import { LoadImageDirective } from '../../../controls/load-image/load-image.directive';
import { TranslateModule } from '@ngx-translate/core';
import { BroadcastService } from '../../../shared/services/broadcast.service';
import { Injector } from '@angular/core';
import { LogService } from '../../../shared/services/log.service';
import { MockLogService } from '../../../test/mocks/log.service.mock';
import { TelemetryService } from '../../../shared/services/telemetry.service';
import { MockTelemetryService } from '../../../test/mocks/telemetry.service.mock';
import { ContainerSettingsManager } from '../container-settings-manager';
import { ContainerImageSourceComponent } from './container-image-source.component';
import { ContainerImageSourceQuickstartComponent } from './container-image-source-quickstart/container-image-source-quickstart.component';
import { ContainerImageSourceACRComponent } from './container-image-source-acr/container-image-source-acr.component';
import { ContainerImageSourceDockerHubComponent } from './container-image-source-dockerhub/container-image-source-dockerhub.component';
import { ContainerImageSourcePrivateRegistryComponent } from './container-image-source-privateregistry/container-image-source-privateregistry.component';
import { RadioSelectorComponent } from '../../../radio-selector/radio-selector.component';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgModel } from '@angular/forms';
import { ContainerLogsComponent } from './container-logs/container-logs.component';
import { ContainerContinuousDeliveryComponent } from './container-continuous-delivery/container-continuos-delivery.component';
import { ContainerMultiConfigComponent } from './container-multiconfig/container-multiconfig.component';

describe('ContainerIamgeSourceComponent', () => {
    let component: ContainerImageSourceComponent;
    let fixture: ComponentFixture<ContainerImageSourceComponent>;
    let containerSettingsManager: ContainerSettingsManager;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    ContainerImageSourceComponent,
                    ContainerImageSourceQuickstartComponent,
                    ContainerImageSourceACRComponent,
                    ContainerImageSourceDockerHubComponent,
                    ContainerImageSourcePrivateRegistryComponent,
                    ContainerLogsComponent,
                    ContainerContinuousDeliveryComponent,
                    ContainerMultiConfigComponent,
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
                ],
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ContainerImageSourceComponent);
        component = fixture.componentInstance;
        containerSettingsManager = TestBed.get(ContainerSettingsManager);

        spyOn(containerSettingsManager, 'resetSettings').and.callThrough();
        spyOn(containerSettingsManager, 'initialize').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });
});
