import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ConfigureGithubComponent } from './configure-github.component';
import { async } from 'q';
import { DeploymentCenterStateManager } from '../../wizard-logic/deployment-center-state-manager';
import { TranslateModule } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CacheService } from '../../../../../shared/services/cache.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LogService } from '../../../../../shared/services/log.service';
import { MockLogService } from '../../../../../shared/test-mocks/log.service.mock';
//import { DeploymentCenterConstants } from '../../../../../shared/models/constants';
import { WizardForm } from '../../wizard-logic/deployment-center-setup-models';
//import { NgSelectTestHelpers, KeyCode } from '../../../../../shared/test-mocks/ng-select-helpers.mock';

describe('ConfigureGithubComponent', () => {

    let component: ConfigureGithubComponent;
    let testFixture: ComponentFixture<ConfigureGithubComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ConfigureGithubComponent],
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
        testFixture = TestBed.createComponent(ConfigureGithubComponent);
        component = testFixture.componentInstance;
        testFixture.detectChanges();
    });

    describe('init', () => {
        it('Orgs should load at start', () => {
            expect(component.OrgList.length).toBeGreaterThan(0);
        });
    });

    describe('Selection Behavior', () => {
        // it('should be able to select repo', () => {
        //     const mockDeploymentCenterStateManager: MockDeploymentCenterStateManager = TestBed.get(DeploymentCenterStateManager);
        //     NgSelectTestHelpers.selectOption(testFixture, 'configure-bitbucket-repo-select', KeyCode.ArrowDown, 0);
        //     const expectedRepoUrl = `${DeploymentCenterConstants.bitbucketUrl}/testfullname1`;
        //     expect(component.selectedRepo).toBe(expectedRepoUrl);
        //     expect(mockDeploymentCenterStateManager.wizardValues.sourceSettings.repoUrl).toBe(expectedRepoUrl)
        // });

    });

    describe('Form Validation', () => {
        // TODO: Form Validation
    });
});


@Injectable()
class MockDeploymentCenterStateManager {
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
        if (content.url.includes('/user/orgs')) {
            return Observable.of({
                json: () => {
                    return [
                        {
                            login: 'Org1',
                            url: 'testOrgUrl1'
                        },
                        {
                            login: 'Org2',
                            url: 'testOrgUrl2'
                        },
                        {
                            login: 'Org3',
                            url: 'testOrgUrl3'
                        },
                        {
                            login: 'Org4',
                            url: 'testOrgUrl4'
                        }
                    ];
                }
            });
        } else if (content.url.includes('/user')) {
            return Observable.of({
                json: () => {
                    return {
                        user: {
                            login: 'testUser1',
                            value: 'testUserUrl1'
                        }
                    };
                }
            });
        }
        return Observable.of(null);
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