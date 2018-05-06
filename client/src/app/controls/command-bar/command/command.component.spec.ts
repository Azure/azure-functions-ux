import { Component, ViewChild } from '@angular/core';
import { CommandComponent } from './command.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { async } from 'q';
import { MockDirective } from 'ng-mocks';
import { LoadImageDirective } from '../../load-image/load-image.directive';
import { By } from '@angular/platform-browser';
import { KeyCodes } from '../../../shared/models/constants';

@Component({
    selector: `app-command-host-component`,
    template: `<command [displayText]="displayText" [iconUrl]="iconUrl" [disabled]="disabled" (click)="onClick($event)"></command>`
})
class TestCommandHostComponent {
    @ViewChild(CommandComponent)
    public commandComponent: CommandComponent;

    public iconUrl = 'testicon';
    public displayText = 'testtext';
    public disabled = false;

    public clicked = false;
    public onClick(event) {
        this.clicked = true;
    }
}

describe('CommandControl', () => {
    let commandComponent: CommandComponent;
    let hostComponent: TestCommandHostComponent;
    let testFixture: ComponentFixture<TestCommandHostComponent>;


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CommandComponent, TestCommandHostComponent, MockDirective(LoadImageDirective)]
        })
            .compileComponents();

    }));

    beforeEach(() => {
        testFixture = TestBed.createComponent(TestCommandHostComponent);
        hostComponent = testFixture.componentInstance;
        commandComponent = hostComponent.commandComponent;
        testFixture.detectChanges();
    });

    describe('init', () => {
        it('should init control', () => {
            expect(commandComponent).toBeTruthy();
        });
        it('should have correct text and icon', () => {
            expect(commandComponent.displayText).toBe('testtext');
            expect(commandComponent.iconUrl).toBe('testicon');
        });

        it('should be enabled by default', () => {
            expect(commandComponent.disabled).toBeFalsy();
        });

    });

    describe('Enabled Behavior', () => {
        it('should not have disabled-command class', () => {
            const elem = testFixture.debugElement.query(By.css('.disabled-command'));
            expect(elem).toBeFalsy();
        });

        it('click should trigger click event', () => {
            const elem = testFixture.debugElement.query(By.css('a'));
            elem.nativeElement.click();
            expect(hostComponent.clicked).toBeTruthy();
        });

        it('enter keypress should trigger click event', () => {
            const elem = testFixture.debugElement.query(By.css('a'));
            elem.triggerEventHandler('keydown', {
                keyCode: KeyCodes.enter
            });
            expect(hostComponent.clicked).toBeTruthy();
        });
    });

    describe('Disabled Behavior', () => {
        it('should have disabled-command class', () => {
            hostComponent.disabled = true;
            testFixture.detectChanges();
            const elem = testFixture.debugElement.query(By.css('.disabled-command'));
            expect(elem).toBeTruthy();
        });
        it('click should not trigger click event', () => {
            hostComponent.disabled = true;
            testFixture.detectChanges();
            const elem = testFixture.debugElement.query(By.css('a'));
            elem.nativeElement.click();
            expect(hostComponent.clicked).toBeFalsy();
        });

        it('enter keypress should trigger click event', () => {
            hostComponent.disabled = true;
            testFixture.detectChanges();
            const elem = testFixture.debugElement.query(By.css('a'));
            elem.triggerEventHandler('keydown', {
                keyCode: KeyCodes.enter
            });
            expect(hostComponent.clicked).toBeFalsy();
        });
    });
});
