import { TextboxComponent } from './textbox.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { async } from 'q';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MockComponent } from 'ng-mocks';
import { PopOverComponent } from '../../pop-over/pop-over.component';

describe('CopyPreComponent', () => {
    let textbox: TextboxComponent;
    let testFixture: ComponentFixture<TextboxComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TextboxComponent, MockComponent(PopOverComponent)],
            providers: [],
            imports: [CommonModule, ReactiveFormsModule, FormsModule]
        })
            .compileComponents();

    }));

    beforeEach(() => {
        testFixture = TestBed.createComponent(TextboxComponent);
        textbox = testFixture.componentInstance;
        testFixture.detectChanges();
    });

    describe('init', () => {
        it('should init control', () => {
            expect(textbox).toBeTruthy();
        });
    });
});
