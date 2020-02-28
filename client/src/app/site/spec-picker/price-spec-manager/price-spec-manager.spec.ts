import { Observable } from 'rxjs/Observable';
import { MockAseService } from './../../../test/mocks/ase.service.mock';
import { BillingService } from './../../../shared/services/billing.service';
import { MockLogService } from './../../../test/mocks/log.service.mock';
import { LogService } from 'app/shared/services/log.service';
import { MockPortalService } from './../../../test/mocks/portal.service.mock';
import { MockPlanService } from './../../../test/mocks/plan.service.mock';
import { PlanPriceSpecManager, SpecPickerInput, PlanSpecPickerData } from './plan-price-spec-manager';
import { async, TestBed, inject } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PlanService } from '../../../shared/services/plan.service';
import { PortalService } from '../../../shared/services/portal.service';
import { MockBillingService } from '../../../test/mocks/billing.service.mock';
import { AseService } from '../../../shared/services/ase.service';
import { PriceSpecGroup, PriceSpecGroupType } from './price-spec-group';
import { PriceSpec, PriceSpecInput } from './price-spec';
import { PortalResources } from '../../../shared/models/portal-resources';
import { Injector } from '@angular/core';
import { ArmSubcriptionDescriptor } from '../../../shared/resourceDescriptors';
import { AuthzService } from './../../../shared/services/authz.service';
import { MockAuthzService } from './../../../test/mocks/authz.service.mock';

xdescribe('Price Spec Manager', () => {
  let specManager: PlanPriceSpecManager;
  let planService: MockPlanService;
  let group1: MockSpecGroup;
  let group2: MockSpecGroup;
  let existingPlanSpecPickerInput: SpecPickerInput<PlanSpecPickerData>;
  let newPlanSpecPickerInput: SpecPickerInput<PlanSpecPickerData>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [TranslateModule.forRoot()],
      providers: [
        PlanPriceSpecManager,
        { provide: AuthzService, useClass: MockAuthzService },
        { provide: PlanService, useClass: MockPlanService },
        { provide: PortalService, useClass: MockPortalService },
        { provide: LogService, useClass: MockLogService },
        { provide: BillingService, useClass: MockBillingService },
        { provide: AseService, useClass: MockAseService },
      ],
    }).compileComponents();

    specManager = TestBed.get(PlanPriceSpecManager);
    planService = TestBed.get(PlanService);

    const injector = TestBed.get(Injector);
    group1 = _getMockGroup(1, injector);
    group2 = _getMockGroup(2, injector);

    specManager.specGroups = [group1, group2];

    existingPlanSpecPickerInput = {
      id: planService.planToReturn.id,
      data: null,
      specPicker: null,
    };

    newPlanSpecPickerInput = {
      id: '/subscriptions/mysub',
      data: {
        subscriptionId: 'mysub',
        location: 'West US',
        hostingEnvironmentName: null,
        allowAseV2Creation: true,
        forbiddenSkus: [],
        isLinux: false,
        isXenon: false,
        hyperV: false,
        selectedLegacySkuName: 'Legacy-Group2-Recommended1',
      },
      specPicker: null,
    };
  }));

  it('should create', inject([PlanPriceSpecManager], (service: PlanPriceSpecManager) => {
    expect(service).toBeTruthy();
  }));

  it('should initialize for new plans', done => {
    const expectedPriceSpecInput: PriceSpecInput = {
      specPickerInput: newPlanSpecPickerInput,
      subscriptionId: newPlanSpecPickerInput.data.subscriptionId,
      plan: null,
    };

    specManager.specGroups.forEach(g => {
      spyOn(g, 'initialize').and.callThrough();
      g.recommendedSpecs.forEach(s => spyOn(s, 'initialize').and.callThrough());
      g.additionalSpecs.forEach(s => spyOn(s, 'initialize').and.callThrough());
    });

    specManager.initialize(newPlanSpecPickerInput).subscribe(r => {
      specManager.specGroups.forEach(g => {
        _verifySpecPickerInput(<jasmine.Spy>g.initialize, expectedPriceSpecInput);
        g.recommendedSpecs.forEach(s => _verifySpecPickerInput(<jasmine.Spy>s.initialize, expectedPriceSpecInput));
        g.additionalSpecs.forEach(s => _verifySpecPickerInput(<jasmine.Spy>s.initialize, expectedPriceSpecInput));
        done();
      });
    });
  });

  it('should initialize for existing plans', done => {
    const expectedPriceSpecInput: PriceSpecInput = {
      specPickerInput: existingPlanSpecPickerInput,
      subscriptionId: new ArmSubcriptionDescriptor(existingPlanSpecPickerInput.id).subscriptionId,
      plan: planService.planToReturn,
    };

    specManager.specGroups.forEach(g => {
      spyOn(g, 'initialize').and.callThrough();
      g.recommendedSpecs.forEach(s => spyOn(s, 'initialize').and.callThrough());
      g.additionalSpecs.forEach(s => spyOn(s, 'initialize').and.callThrough());
    });

    specManager.initialize(existingPlanSpecPickerInput).subscribe(r => {
      specManager.specGroups.forEach(g => {
        _verifySpecPickerInput(<jasmine.Spy>g.initialize, expectedPriceSpecInput);
        g.recommendedSpecs.forEach(s => _verifySpecPickerInput(<jasmine.Spy>s.initialize, expectedPriceSpecInput));
        g.additionalSpecs.forEach(s => _verifySpecPickerInput(<jasmine.Spy>s.initialize, expectedPriceSpecInput));
        done();
      });
    });
  });

  it('should filter out hidden specs and keep disabled specs', () => {
    group1.recommendedSpecs[1].state = 'disabled';
    group1.additionalSpecs[2].state = 'hidden';

    (<any>specManager)._inputs = existingPlanSpecPickerInput;
    specManager.cleanUpGroups();

    expect(group1.recommendedSpecs.length).toEqual(3);
    expect(group1.additionalSpecs.length).toEqual(2);
    expect(group1.additionalSpecs[0].skuCode).toEqual('Group1-Additional1');
    expect(group1.additionalSpecs[1].skuCode).toEqual('Group1-Additional2');
    expect(group2.recommendedSpecs.length).toEqual(3);
    expect(group2.additionalSpecs.length).toEqual(3);
  });

  it('should select a default spec that matches an existing plan', () => {
    const injector = TestBed.get(Injector);

    const testCases = [
      {
        selectedSpec: group1.recommendedSpecs[1],
        selectedGroupIndex: 0,
        isExpanded: false,
      },
      {
        selectedSpec: group1.additionalSpecs[0],
        selectedGroupIndex: 0,
        isExpanded: true,
      },
      {
        selectedSpec: group2.recommendedSpecs[2],
        selectedGroupIndex: 1,
        isExpanded: false,
      },
      {
        selectedSpec: group2.additionalSpecs[1],
        selectedGroupIndex: 1,
        isExpanded: true,
      },
    ];

    (<any>specManager)._inputs = existingPlanSpecPickerInput;
    (<any>specManager)._plan = planService.planToReturn;

    testCases.forEach(t => {
      const group1Copy = _getMockGroup(1, injector);
      const group2Copy = _getMockGroup(2, injector);
      specManager.specGroups = [group1Copy, group2Copy];
      planService.planToReturn.sku.name = t.selectedSpec.skuCode;
      specManager.cleanUpGroups();

      expect(specManager.selectedSpecGroup).toEqual(specManager.specGroups[t.selectedGroupIndex]);
      expect(specManager.selectedSpecGroup.isExpanded).toEqual(t.isExpanded);

      specManager.specGroups.forEach(g => {
        if (g !== specManager.selectedSpecGroup) {
          // Ensure that the first recommended spec is selected for any group that's
          // not selected by default
          expect(g.selectedSpec === g.recommendedSpecs[0]);
        }
      });
    });
  });

  function _getMockGroup(groupNumber: number, injector: Injector) {
    return new MockSpecGroup(
      injector,
      specManager,
      [
        new MockPriceSpec(injector, `Group${groupNumber}-Recommended1`, 'Recommended1'),
        new MockPriceSpec(injector, `Group${groupNumber}-Recommended2`, 'Recommended2'),
        new MockPriceSpec(injector, `Group${groupNumber}-Recommended3`, 'Recommended3'),
      ],
      [
        new MockPriceSpec(injector, `Group${groupNumber}-Additional1`, 'Additional1'),
        new MockPriceSpec(injector, `Group${groupNumber}-Additional2`, 'Additional2'),
        new MockPriceSpec(injector, `Group${groupNumber}-Additional3`, 'Additional3'),
      ]
    );
  }

  function _verifySpecPickerInput(spy: jasmine.Spy, expectedPriceSpecInput: PriceSpecInput) {
    const actualInput = <PriceSpecInput>spy.calls.argsFor(0)[0];
    expect(actualInput.specPickerInput).toEqual(expectedPriceSpecInput.specPickerInput);
    expect(actualInput.plan).toEqual(expectedPriceSpecInput.plan);
    expect(actualInput.subscriptionId).toEqual(expectedPriceSpecInput.subscriptionId);
  }
});

class MockPriceSpec extends PriceSpec {
  tier = null;
  skuCode = null;
  legacySkuName = null;
  topLevelFeatures = [this._ts.instant(PortalResources.pricing_sharedInfrastructure)];

  featureItems = [
    {
      iconUrl: 'image/ssl.svg',
      title: this._ts.instant(PortalResources.pricing_customDomainsSsl),
      description: this._ts.instant(PortalResources.pricing_customDomainsSslDesc),
    },
  ];

  hardwareItems = [
    {
      iconUrl: 'image/app-service-plan.svg',
      title: PortalResources.cpu,
      description: PortalResources.pricing_sharedCpu,
    },
  ];

  meterFriendlyName = null;

  specResourceSet = {
    id: this.skuCode,
    firstParty: [
      {
        id: this.skuCode,
        quantity: 700,
        resourceId: null,
      },
    ],
  };

  constructor(injector: Injector, skuCode: string, tier: string) {
    super(injector);
    this.tier = tier;
    this.skuCode = skuCode;
    this.legacySkuName = `Legacy-${skuCode}`;
    this.meterFriendlyName = `${skuCode} App Service`;
  }

  runInitialization(input: PriceSpecInput) {
    return Observable.of(null);
  }
}

class MockSpecGroup extends PriceSpecGroup {
  recommendedSpecs: PriceSpec[] = [];
  additionalSpecs: PriceSpec[] = [];
  selectedSpec = null;
  iconUrl = 'image/tools.svg';
  title = this.ts.instant(PortalResources.pricing_devTestTitle);
  id = PriceSpecGroupType.DEV_TEST;
  description = this.ts.instant(PortalResources.pricing_devTestDesc);
  emptyMessage = this.ts.instant(PortalResources.pricing_emptyDevTestGroup);
  emptyInfoLink = '';

  constructor(injector: Injector, specManager: PlanPriceSpecManager, recommendedSpecs: PriceSpec[], additionalSpecs: PriceSpec[]) {
    super(injector, specManager);
    this.recommendedSpecs = recommendedSpecs;
    this.additionalSpecs = additionalSpecs;
  }

  initialize(input: PriceSpecInput) {}
}
