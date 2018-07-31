import { Component, ViewChild } from '@angular/core';
import { CopyPreComponent } from './copy-pre.component';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { UtilitiesService } from '../shared/services/utilities.service';
import { async } from 'q';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from 'ng-mocks';
import { PopOverComponent } from '../pop-over/pop-over.component';
import { By } from '@angular/platform-browser';

@Component({
    selector: `app-copy-pre-host-component`,
    template: `<copy-pre [content]="content"></copy-pre>`
})
class TestCopyPreComponent {
    @ViewChild(CopyPreComponent)
    public copyPreComponent: CopyPreComponent;

    content = 'content';
    label = 'label';
}

describe('CopyPreComponent', () => {
    let copyPreComponent: CopyPreComponent;
    let hostComponent: TestCopyPreComponent;
    let testFixture: ComponentFixture<TestCopyPreComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CopyPreComponent, TestCopyPreComponent, MockComponent(PopOverComponent)],
            providers: [UtilitiesService],
            imports: [CommonModule, TranslateModule.forRoot()]
        })
            .compileComponents();

    }));

    beforeEach(() => {
        testFixture = TestBed.createComponent(TestCopyPreComponent);
        hostComponent = testFixture.componentInstance;
        copyPreComponent = hostComponent.copyPreComponent;
        testFixture.detectChanges();
    });

    describe('init', () => {
        it('should init control', () => {
            expect(copyPreComponent).toBeTruthy();
        });

        it('selectOnClick should be true by default', () => {
            expect(copyPreComponent.selectOnClick).toBeTruthy();
        });

        it('passwordField should be false by default', () => {
            expect(copyPreComponent.passwordField).toBeFalsy();
        });
    });

    describe('highlight text', () => {
        it('should highlight text when clicked by default', () => {
            const elem = testFixture.debugElement.query(By.css('pre'));
            elem.nativeElement.click();
            const selection = window.getSelection().toString();
            expect(selection).toBe('content');
        });

        it('should not highlight text is selectOnClick is disabled', () => {
            copyPreComponent.selectOnClick = false;
            const elem = testFixture.debugElement.query(By.css('pre'));
            elem.nativeElement.click();
            const selection = window.getSelection().toString();
            expect(selection).toBe('');
        });
    });

    describe('copy to clipboard in newer browsers', () => {
        it('should copy content to clipboard in utility service', fakeAsync((done) => {
            spyOn(navigator['clipboard'], 'writeText').and.callThrough();
            copyPreComponent.copyToClipboard();
            expect(navigator['clipboard']['writeText']).toHaveBeenCalledWith('content');
        }));
    });

    describe('Password Field', () => {
        it('should show dots in field when contentView is false', () => {
            copyPreComponent.contentView = false;
            copyPreComponent.passwordField = true;
            testFixture.detectChanges();
            const elem = testFixture.debugElement.query(By.css('pre'));
            expect(elem.nativeElement.innerText).toBe(copyPreComponent.hiddenContentPlaceholder);
        });

        it('should show password when show button is clicked', () => {
            copyPreComponent.contentView = false;
            copyPreComponent.passwordField = true;
            testFixture.detectChanges();
            copyPreComponent.showPassword();
            expect(copyPreComponent.passwordField).toBeTruthy();
            expect(copyPreComponent.contentView).toBeTruthy();
        });

        it('should hide password when hide button is clicked', () => {
            copyPreComponent.contentView = true;
            copyPreComponent.passwordField = true;
            testFixture.detectChanges();
            copyPreComponent.hidePassword();
            expect(copyPreComponent.passwordField).toBeTruthy();
            expect(copyPreComponent.contentView).toBeFalsy();
        });

    });
});
