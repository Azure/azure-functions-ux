import { TestBed, inject, fakeAsync } from '@angular/core/testing';
import { DeploymentCenterStateManager } from './deployment-center-state-manager';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CacheService } from '../../../../shared/services/cache.service';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { UserService } from '../../../../shared/services/user.service';
import { PortalService } from '../../../../shared/services/portal.service';
import { FormBuilder } from '@angular/forms';
import * as graphHelper from '../../../../pickers/microsoft-graph/microsoft-graph-helper';
import { SiteService } from '../../../../shared/services/site.service';
import { ScenarioService, IScenarioService } from '../../../../shared/services/scenario/scenario.service';
import { ScenarioCheckInput, ScenarioCheckResult } from '../../../../shared/services/scenario/scenario.models';
import { of } from 'rxjs/observable/of';
import { AuthzService } from '../../../../shared/services/authz.service';
import { AzureDevOpsService } from './azure-devops.service';

describe('Deployment State Manager', () => {
  let _fb: FormBuilder;
  const starterWizardForm = () => {
    return _fb.group({
      sourceProvider: [null],
      buildProvider: ['kudu'],
      sourceSettings: _fb.group({
        repoUrl: ['github'],
        branch: [null],
        isManualIntegration: [false],
        deploymentRollbackEnabled: [false],
        isMercurial: [false],
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
          djangoSettingsModule: ['DjangoProjectName.settings'],
        }),
        nodejsTaskRunner: [null],
      }),
      deploymentSlotSetting: _fb.group({
        newDeploymentSlot: [false],
        deploymentSlotEnabled: [false],
        deploymentSlot: ['slot'],
      }),
    });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DeploymentCenterStateManager,
        AzureDevOpsService,
        { provide: CacheService, useClass: MockCacheService },
        { provide: SiteService, useClass: MockSiteService },
        { provide: UserService, useClass: MockUserService },
        { provide: PortalService, useClass: MockPortalService },
        { provide: ScenarioService, useClass: MockScenarioService },
        { provide: AuthzService, useClass: MockAuthZService },
        FormBuilder,
      ],
    });
    const userService: MockUserService = TestBed.get(UserService);
    userService.startupInfoStream.next({
      token: 'adtoken',
    });
    _fb = TestBed.get(FormBuilder);
    spyOn(graphHelper, 'parseToken').and.callFake((token: string) => {
      return {
        tid: 'tenantId',
      };
    });
  });

  describe('init', () => {
    it('should be created', inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
      expect(service).toBeTruthy();
    }));

    it('should recieve inital resource id', inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
      service.resourceIdStream$.next('/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Web/sites/site');
      expect(service['_resourceId']).toBe('/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Web/sites/site');
    }));

    it('should fetch site location and sku on resourceId recieve', inject(
      [DeploymentCenterStateManager],
      (service: DeploymentCenterStateManager) => {
        service.resourceIdStream$.next('/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Web/sites/site');
        expect(service['_location']).toBe('loc');
        expect(service.siteArm.location).toBe('loc');
        expect(service.siteArm.properties.sku).toBe('sku');
      }
    ));

    it('get tfs token on first load', inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
      expect(service['_vstsApiToken']).toBe('vststoken');
    }));

    it('get ad token on first load', inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
      expect(service['_token']).toBe('adtoken');
    }));

    it('get token should return ad token', inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
      expect(service.getToken()).toBe('Bearer adtoken');
    }));

    it('should fetch subscription name on resourceId recieve', inject(
      [DeploymentCenterStateManager],
      (service: DeploymentCenterStateManager) => {
        service.resourceIdStream$.next('/subscriptions/sub/resourceGroups/rg/providers/Microsoft.Web/sites/site');
        expect(service.subscriptionName).toBe('displayName');
      }
    ));
  });

  describe('wizard form', () => {
    it('should get wizard values after initialization', inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
      service.wizardForm = starterWizardForm();
      expect(service.wizardValues.buildProvider).toBe('kudu');
    }));

    it('should be able to change wizard values', inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
      service.wizardForm = starterWizardForm();
      const wizardValues = service.wizardValues;
      wizardValues.sourceProvider = 'vsts';
      service.wizardValues = wizardValues;
      expect(service.wizardValues.sourceProvider).toBe('vsts');
    }));

    it('should be get source settings form group', inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
      service.wizardForm = starterWizardForm();
      expect(service.sourceSettings.value.repoUrl).toBe('github');
    }));

    it('source settings returns null if uninitialized', inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
      expect(service.sourceSettings).toBeNull();
    }));

    it('should be get build settings form group', inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
      service.wizardForm = starterWizardForm();
      expect(service.buildSettings.value.vstsAccount).toBe('account');
    }));

    it('build settings returns null if uninitialized', inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
      expect(service.buildSettings).toBeNull();
    }));
  });

  describe('kudu deployment', () => {
    it('kudu deployment flow triggers', inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
      service.wizardForm = starterWizardForm();
      const deploySpyKudu = spyOn(service, '_deployKudu').and.callThrough();
      const deploySpyVsts = spyOn(service, '_deployVsts').and.callThrough();
      service.deploy();
      expect(deploySpyKudu).toHaveBeenCalled();
      expect(deploySpyVsts).not.toHaveBeenCalled();
    }));

    it('external source provider forces manual ingtegration to on', fakeAsync(
      inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
        service.wizardForm = starterWizardForm();
        const wizardFormValues = service.wizardValues;
        wizardFormValues.sourceSettings.isManualIntegration = false;
        wizardFormValues.sourceProvider = 'external';
        service.wizardValues = wizardFormValues;
        service.deploy().subscribe(({ result }) => expect(result.properties.isManualIntegration).toBeTruthy());
      })
    ));

    it('Local git sets the web config', fakeAsync(
      inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
        service.wizardForm = starterWizardForm();
        const wizardFormValues = service.wizardValues;
        wizardFormValues.sourceProvider = 'localgit';
        service.wizardValues = wizardFormValues;
        service.deploy().subscribe(({ result }) => expect(result.properties.scmType).toBe('LocalGit'));
      })
    ));
  });

  describe('vsts deployment', () => {
    it('vsts deployment flow triggers', inject([DeploymentCenterStateManager], (service: DeploymentCenterStateManager) => {
      service.resourceIdStream$.next('/subscriptions/sub/resourcegroups/rg/providers/Microsoft.Web/sites/site');
      service.wizardForm = starterWizardForm();
      service.wizardValues = { ...service.wizardValues, buildProvider: 'vsts' };
      const deploySpyKudu = spyOn(service, '_deployKudu').and.callThrough();
      const deploySpyVsts = spyOn(service, '_deployVsts').and.callThrough();
      service.deploy();
      expect(deploySpyKudu).not.toHaveBeenCalled();
      expect(deploySpyVsts).toHaveBeenCalled();
    }));

    it('get correct vsts direct call headers', inject([AzureDevOpsService], (service: AzureDevOpsService) => {
      const headers = service.getAzDevDirectHeaders(true);
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Accept')).toBe('application/json');
      expect(headers.get('Authorization')).toBe(`Bearer ${service['_token']}`);
      expect(headers.get('X-VSS-ForceMsaPassThrough')).toBe('true');
    }));

    it('get correct vsts passthrough call headers', inject([AzureDevOpsService], (service: AzureDevOpsService) => {
      const headers = service.getAzDevDirectHeaders(false);
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Accept')).toBe('application/json');
      expect(headers.get('Authorization')).toBe(`Bearer ${service['_token']}`);
      expect(headers.get('X-VSS-ForceMsaPassThrough')).toBeUndefined();
    }));
  });
});

@Injectable()
class MockCacheService {
  get(url: string, force?: boolean, headers?: Headers, invokeApi?: boolean): Observable<Response> {
    return Observable.of(null);
  }

  post(url: string, force?: boolean, headers?: Headers, content?: any) {
    return Observable.of(null);
  }

  getArm(resourceId: string, force?: boolean, apiVersion?: string, invokeApi?: boolean) {
    return Observable.of({
      json: () => {
        return {
          displayName: 'displayName',
        };
      },
    });
  }

  postArm(resourceId: string, force?: boolean, apiVersion?: string, content?: any): Observable<Response> {
    return Observable.of(null);
  }

  patchArm(resourceId: string, apiVersion?: string, content?: any) {
    return Observable.of({
      json: () => {
        return content;
      },
    });
  }
  putArm(resourceId: string, apiVersion?: string, content?: any) {
    return Observable.of({
      json: () => {
        return content;
      },
    });
  }
}

@Injectable()
class MockSiteService {
  public siteObject = {
    location: 'loc',
    kind: 'app',
    properties: {
      sku: 'sku',
    },
  };
  getSite(resourceId: string) {
    return Observable.of({
      isSuccessful: true,
      result: this.siteObject,
    });
  }
}
@Injectable()
class MockUserService {
  public startupInfoStream = new ReplaySubject<any>();
  getStartupInfo() {
    return this.startupInfoStream;
  }
}

@Injectable()
class MockPortalService {
  public getAdToken(token: string) {
    return Observable.of({
      result: {
        token: 'vststoken',
      },
    });
  }
}

class MockScenarioService implements IScenarioService {
  checkScenario(id: string, input?: ScenarioCheckInput): ScenarioCheckResult {
    return {
      status: 'enabled',
      environmentName: 'any',
      id: id,
    };
  }
  checkScenarioAsync(id: string, input?: ScenarioCheckInput): Observable<ScenarioCheckResult> {
    const result: ScenarioCheckResult = {
      status: 'enabled',
      environmentName: 'any',
      id: id,
    };

    return of(result);
  }
  _getFinalResult(id: string, results: ScenarioCheckResult[]) {
    return {
      status: 'enabled',
      environmentName: 'any',
      id: id,
    };
  }
}
class MockAuthZService {
  hasPermission(resourceId: string, requestedActions: string[]): Observable<boolean> {
    return of(true);
  }
}
