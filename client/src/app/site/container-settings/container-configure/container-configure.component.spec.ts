import { ContainerConfigureComponent } from './container-configure.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ContainerSettingsManager } from '../container-settings-manager';
import { Injector } from '@angular/core';
import { BroadcastService } from '../../../shared/services/broadcast.service';
import { LogService } from '../../../shared/services/log.service';
import { MockLogService } from '../../../test/mocks/log.service.mock';
import { TelemetryService } from '../../../shared/services/telemetry.service';
import { MockTelemetryService } from '../../../test/mocks/telemetry.service.mock';
import { ContainerHostComponent } from '../container-host/container-host.component';
import { ContainerImageSourceComponent } from '../container-image-source/container-image-source.component';
import { LoadImageDirective } from '../../../controls/load-image/load-image.directive';
import { MockDirective, MockComponent } from 'ng-mocks';
import { ContainerImageSourceQuickstartComponent } from '../container-image-source/container-image-source-quickstart/container-image-source-quickstart.component';
import { ContainerImageSourceACRComponent } from '../container-image-source/container-image-source-acr/container-image-source-acr.component';
import { ContainerImageSourceDockerHubComponent } from '../container-image-source/container-image-source-dockerhub/container-image-source-dockerhub.component';
import { ContainerImageSourcePrivateRegistryComponent } from '../container-image-source/container-image-source-privateregistry/container-image-source-privateregistry.component';
import { RadioSelectorComponent } from '../../../radio-selector/radio-selector.component';

describe('ContainerConfigureComponent', () => {
    let component: ContainerConfigureComponent;
    let fixture: ComponentFixture<ContainerConfigureComponent>;
    let containerSettingsManager: ContainerSettingsManager;

    beforeEach(() => {
        TestBed
            .configureTestingModule({
                declarations: [
                    ContainerConfigureComponent,
                    ContainerHostComponent,
                    ContainerImageSourceComponent,
                    ContainerImageSourceQuickstartComponent,
                    ContainerImageSourceACRComponent,
                    ContainerImageSourceDockerHubComponent,
                    ContainerImageSourcePrivateRegistryComponent,
                    MockDirective(LoadImageDirective),
                    MockComponent(RadioSelectorComponent),
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
        fixture = TestBed.createComponent(ContainerConfigureComponent);
        component = fixture.componentInstance;
        containerSettingsManager = TestBed.get(ContainerSettingsManager);

        spyOn(containerSettingsManager, 'resetSettings').and.callThrough();
        spyOn(containerSettingsManager, 'initialize').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });
});
