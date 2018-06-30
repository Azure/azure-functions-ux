import { TestBed, ComponentFixture } from '@angular/core/testing';
import { async } from 'q';
import { Component, ViewChild } from '@angular/core';
import { CardInfoControlComponent } from './card-info-control.component';
import { MockDirective } from 'ng-mocks';
import { LoadImageDirective } from '../load-image/load-image.directive';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: `app-card-info-host-component`,
    template: `<app-card-info-control [image]="image" [header]="header" [description]="description" [learnMoreLink]="learnMoreLink"></app-card-info-control>`
})
class TestCardInfoHostComponent {
    @ViewChild(CardInfoControlComponent)
    public cardDashbaordComponent: CardInfoControlComponent;

    public image = '';
    public header = '';
    public description = '';
    public learnMoreLink = '';
}

describe('CardInfoControl', () => {
    let cardInfoComponent: CardInfoControlComponent;
    let hostComponent: TestCardInfoHostComponent;
    let testFixture: ComponentFixture<TestCardInfoHostComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CardInfoControlComponent, TestCardInfoHostComponent, MockDirective(LoadImageDirective)],
            providers: [
            ],
            imports: [TranslateModule.forRoot()]
        })
            .compileComponents();

    }));

    beforeEach(() => {
        testFixture = TestBed.createComponent(TestCardInfoHostComponent);
        hostComponent = testFixture.componentInstance;
        cardInfoComponent = hostComponent.cardDashbaordComponent;
        testFixture.detectChanges();
    });

    describe('init', () => {
        it('control initiates', () => {
            expect(cardInfoComponent).toBeTruthy();
        });
    });
});
