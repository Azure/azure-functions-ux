import { Component, ViewChild } from '@angular/core';
import { SpecListComponent } from './spec-list.component';
import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { By } from '@angular/platform-browser';

@Component({
  selector: `spec-list-host-component`,
  template: `<spec-list [specGroup]='specGroup' [isRecommendedList]='isRecommendedList'></spec-list>`
})
class TestSpecListComponent {
    @ViewChild(SpecListComponent) public slComponent: SpecListComponent;

    public isRecommendedList = false;

    public specGroup = {
        recommendedSpecs: [],
        additionalSpecs: [
            {
                cssClass: 'additionalCss1',
                skuCode: 'AdditionalItem1',
                topLevelFeatures: [],
                state: 'enabled',
                priceString: 'price1',
                disabledInfoLink: '',
                disabledMessage: ''
            },
            {
                cssClass: 'additionalCss2',
                skuCode: 'AdditionalItem2',
                topLevelFeatures: [],
                state: 'hidden',
                priceString: 'price2',
                disabledInfoLink: '',
                disabledMessage: ''
            }
        ],
        selectedSpec: null,
        id: 'specGroup'
    };
}

describe('SpecList', () => {
    let hostComponent: TestSpecListComponent;
    let specListComponent: SpecListComponent;
    let testFixture: ComponentFixture<TestSpecListComponent>;

    beforeEach(async(() => {
        TestBed
            .configureTestingModule({
                declarations: [SpecListComponent, TestSpecListComponent],
                imports: [TranslateModule.forRoot()]
            })
            .compileComponents();
    }));

    beforeEach(() => {
        testFixture = TestBed.createComponent(TestSpecListComponent);
        hostComponent = testFixture.componentInstance;
        specListComponent = hostComponent.slComponent;
        testFixture.detectChanges();
    });

    describe('init', () => {
        it('should initialize component', () => {
            expect(hostComponent).toBeTruthy();
        });

        it('should render one additional item', () => {
            const elem = testFixture.debugElement.query(By.css('.spec-container'));
            expect(elem).not.toBeNull();
            expect(elem.children.length).toEqual(2);

            const enabledSpec = elem.children.find(child => child.properties.id === 'specGroupAdditionalItem1' && !child.properties.hidden);
            expect(enabledSpec).not.toBeNull();

            const hiddenSpec = elem.children.find(child => child.properties.id === 'specGroupAdditionalItem2' && child.properties.hidden);
            expect(hiddenSpec).not.toBeNull();
        });
    });
});
