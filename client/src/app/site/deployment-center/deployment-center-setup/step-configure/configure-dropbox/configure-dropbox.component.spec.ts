import { TestBed, ComponentFixture } from '@angular/core/testing';
import { async } from 'q';
import { DeploymentCenterStateManager } from '../../wizard-logic/deployment-center-state-manager';
import { TranslateModule } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CacheService } from '../../../../../shared/services/cache.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LogService } from '../../../../../shared/services/log.service';
import { WizardForm } from '../../wizard-logic/deployment-center-setup-models';
import { ConfigureDropboxComponent } from './configure-dropbox.component';
import { DeploymentCenterConstants } from '../../../../../shared/models/constants';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { MockLogService } from '../../../../../test/mocks/log.service.mock';
import { NgSelectTestHelpers, KeyCode } from '../../../../../test/mocks/ng-select-helpers.mock';

describe('ConfigureDropboxComponent', () => {

    let component: ConfigureDropboxComponent;
    let testFixture: ComponentFixture<ConfigureDropboxComponent>;
    let wizard: MockDeploymentCenterStateManager;
    const siteId = 'subscriptions/sub/resourcegroups/rg/providers/microsoft.web/sites/siteName';
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ConfigureDropboxComponent],
            providers: [
                { provide: DeploymentCenterStateManager, useClass: MockDeploymentCenterStateManager },
                { provide: CacheService, useClass: MockCacheService },
                { provide: LogService, useClass: MockLogService },
                FormBuilder
            ],
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule, NgSelectModule]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        testFixture = TestBed.createComponent(ConfigureDropboxComponent);
        component = testFixture.componentInstance;
        testFixture.detectChanges();
        wizard = TestBed.get(DeploymentCenterStateManager);
    });

    describe('init', () => {
        it('Folder list should be empty when started', () => {
            expect(component.folderList.length).toBe(0);
        });


    });

    describe('Folder List Loading', () => {
        it('Folder list should load when resource id is passed in', () => {
            wizard.resourceIdStream$.next(siteId);
            expect(component.folderList.length).toBeGreaterThan(0);
        });

        it('Default folder should be name of current site', () => {
            wizard.resourceIdStream$.next(siteId);
            expect(component.selectedFolder).toBe(`${DeploymentCenterConstants.dropboxUri}/siteName`);
        });

        it('Default folder name should reflect in form', () => {
            wizard.resourceIdStream$.next(siteId);
            testFixture.detectChanges();
            expect(wizard.wizardValues.sourceSettings.repoUrl).toBe(`${DeploymentCenterConstants.dropboxUri}/siteName`);
        });

        it('Should only load folder tagged items', () => {
            wizard.resourceIdStream$.next(siteId);
            // test3 is a file tagged item and should be filtered out of the folder list
            expect(component.folderList.filter(x => x.displayLabel === 'test3').length).toBe(0);
        });
    });
    describe('Selection Behavior', () => {
        it('should be able to select folder', () => {
            wizard.resourceIdStream$.next(siteId);
            testFixture.detectChanges();
            NgSelectTestHelpers.selectOption(testFixture, 'configure-dropbox-folder-select', KeyCode.ArrowDown, 1);
            testFixture.detectChanges();
            const expectedRepoUrl = `${DeploymentCenterConstants.dropboxUri}/testName1`;
            expect(component.selectedFolder).toBe(expectedRepoUrl);
        });

    });

    describe('Form Validation', () => {
        // TODO: Form Validation
    });
});


@Injectable()
class MockDeploymentCenterStateManager {
    public resourceIdStream$ = new ReplaySubject<string>();
    public wizardForm: FormGroup;
    constructor(_fb: FormBuilder) {
        this.wizardForm = _fb.group({
            sourceProvider: [null],
            buildProvider: ['kudu'],
            sourceSettings: _fb.group({
                repoUrl: ['github'],
                branch: [null],
                isManualIntegration: [false],
                deploymentRollbackEnabled: [false],
                isMercurial: [false]
            }),
            buildSettings: _fb.group({
                createNewVsoAccount: [false],
                vstsAccount: ['account'],
                vstsProject: [null],
                location: [null],
                applicationFramework: [null],
                workingDirectory: [null],
                pythonSettings: _fb.group({
                    framework: [null],
                    version: [null],
                    flaskProjectName: ['flaskProjectName'],
                    djangoSettingsModule: ['DjangoProjectName.settings']
                }),
                nodejsTaskRunner: [null]
            }),
            deploymentSlotSetting: _fb.group({
                newDeploymentSlot: [false],
                deploymentSlotEnabled: [false],
                deploymentSlot: ['slot']
            }),
            testEnvironment: _fb.group({
                enabled: [false],
                newApp: [true],
                appServicePlanId: ['aspid'],
                webAppId: [null]
            })
        });
    };

    public get wizardValues(): WizardForm {
        return this.wizardForm.value;
    }

    public get sourceSettings(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.sourceSettings as FormGroup)) || null;
    }

    public getToken() {
        return '';
    }
}



@Injectable()
class MockCacheService {
    public siteObject = {
        location: 'loc',
        properties: {
            sku: 'sku'
        }
    };
    get(url: string, force?: boolean, headers?: Headers, invokeApi?: boolean): Observable<Response> {
        return Observable.of(null);
    }

    post(url: string, force?: boolean, headers?: Headers, content?: { url: string }) {
        return Observable.of({
            json: () => {
                return {
                    entries: [
                        {
                            name: 'testName1',
                            '.tag': 'folder'
                        },
                        {
                            name: 'testName2',
                            '.tag': 'folder'
                        },
                        {
                            name: 'testName3',
                            '.tag': 'file'
                        },
                        {
                            name: 'testName4',
                            '.tag': 'folder'
                        }
                    ]
                };
            }
        });
    }

    getArm(resourceId: string, force?: boolean, apiVersion?: string, invokeApi?: boolean) {
        return Observable.of({
            json: () => {
                return this.siteObject;
            }
        });
    }

    postArm(resourceId: string, force?: boolean, apiVersion?: string, content?: any): Observable<Response> {
        return Observable.of(null);
    }

    putArm(resourceId: string, apiVersion?: string, content?: any) {
        return Observable.of({
            json: () => {
                return content;
            }
        });
    }
}
