import { CommonModule } from '@angular/common';
import { async } from 'q';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfoBoxComponent } from './info-box.component';
import { MockDirective } from 'ng-mocks';
import { LoadImageDirective } from '../load-image/load-image.directive';
import { Component, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { KeyCodes } from '../../shared/models/constants';

@Component({
    selector: `app-info-box-host-component`,
    template: `<info-box [infoText]="infoText" [infoLink]="infoLink" [infoActionFn]="infoActionFn" [typeClass]="type"></info-box>`
})
class TestInfoboxHostComponent {
    @ViewChild(InfoBoxComponent)
    public ibComponent: InfoBoxComponent;

    public infoText = 'testtext';
    public infoLink = 'testLink';
    public infoActionFn = null;
    public type: 'info' | 'warning' | 'error' = 'info';
}

describe('InfoBox', () => {
    let hostComponent: TestInfoboxHostComponent;
    let infoboxComponent: InfoBoxComponent;
    let testFixture: ComponentFixture<TestInfoboxHostComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [InfoBoxComponent, TestInfoboxHostComponent, MockDirective(LoadImageDirective)],
            imports: [CommonModule]
        })
            .compileComponents();

    }));

    beforeEach(() => {
        testFixture = TestBed.createComponent(TestInfoboxHostComponent);
        hostComponent = testFixture.componentInstance;
        infoboxComponent = hostComponent.ibComponent;
        testFixture.detectChanges();

        spyOn( window, 'open' ).and.callFake( function() {
            return true;
        } );
    });

    describe('init', () => {
        it('should initialize component', () => {
            expect(infoboxComponent).toBeTruthy();
        });

        it('should initialize to info type', () => {
            expect(infoboxComponent.iconPath).toBe('image/info.svg');
            expect(infoboxComponent.typeClass).toBe('info');
        });
    });

    describe('Types', () => {
        it('should set warning values correctly', () => {
            hostComponent.type = 'warning';
            testFixture.detectChanges();
            expect(infoboxComponent.iconPath).toBe('image/warning.svg');
            expect(infoboxComponent.typeClass).toBe('warning');
        });

        it('should set error values correctly', () => {
            hostComponent.type = 'error';
            testFixture.detectChanges();
            expect(infoboxComponent.iconPath).toBe('image/error.svg');
            expect(infoboxComponent.typeClass).toBe('error');
        });
    });

    describe('Link Events', () => {
        it('click should open link', () => {
            hostComponent.infoLink = 'testClickLink';
            testFixture.detectChanges();
            const elem = testFixture.debugElement.query(By.css('.info-box'));
            elem.nativeElement.click();
            expect(window.open).toHaveBeenCalledWith('testClickLink', '_blank');
        });

        it('enter should open link', () => {
            hostComponent.infoLink = 'testEnterLink';
            testFixture.detectChanges();
            const elem = testFixture.debugElement.query(By.css('.info-box'));
            elem.triggerEventHandler('keydown', {
                keyCode: KeyCodes.enter
            });
            expect(window.open).toHaveBeenCalledWith('testEnterLink', '_blank');
        });
    });

    describe('Action Events', () => {
        it('click should invoke action if one is defined', () => {
            let clicked = false;
            hostComponent.infoActionFn = () => clicked = true;
            testFixture.detectChanges();
            const elem = testFixture.debugElement.query(By.css('.info-box'));
            elem.nativeElement.click();
            expect(clicked).toBeTruthy();
        });

        it('enter should invoke action if one is defined', () => {
            let clicked = false;
            hostComponent.infoActionFn = () => clicked = true;
            testFixture.detectChanges();
            const elem = testFixture.debugElement.query(By.css('.info-box'));
            elem.triggerEventHandler('keydown', {
                keyCode: KeyCodes.enter
            });
            expect(clicked).toBeTruthy();
        });
    });
    describe('Misc Events', () => {
        it('non enter keycode should do nothing', () => {
            hostComponent.infoLink = 'testEnterLink';
            testFixture.detectChanges();
            const elem = testFixture.debugElement.query(By.css('.info-box'));
            elem.triggerEventHandler('keydown', {
                keyCode: KeyCodes.arrowDown
            });
            expect(window.open).not.toHaveBeenCalledWith('testEnterLink', '_blank');
        });

        it('clicking with no action or link defined should do nothing', () => {
            hostComponent.infoLink = '';
            testFixture.detectChanges();
            const elem = testFixture.debugElement.query(By.css('.info-box'));
            elem.nativeElement.click();
            expect(window.open).not.toHaveBeenCalled();
        });
    });
});
