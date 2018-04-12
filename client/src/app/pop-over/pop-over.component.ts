import { Component, Input, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { KeyCodes } from '../shared/models/constants';

@Component({
    selector: 'pop-over',
    templateUrl: './pop-over.component.html',
    styleUrls: ['./pop-over.component.scss']
})
export class PopOverComponent implements OnDestroy {

    @Input() message: string;
    @Input() hideAfter: number;
    @Input() isInputError: boolean;
    @Input() isInputWarning: boolean;
    @Input() popOverClass = 'pop-over-container';
    @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'top';

    public show: boolean;

    @ViewChild('container') container: ElementRef;
    @ViewChild('button') button: ElementRef;
    @ViewChild('content') content: ElementRef;

    private _focusState: 'focused' | 'blurring' | 'blurred' = 'blurred';
    private _focusFunc = (e: FocusEvent) => { this._focusListener(e); };
    private _blurFunc = (e: FocusEvent) => { this._blurListener(e); };
    private _hideAfterTimer: number = null;

    constructor() { }

    public ngOnDestroy() {
        this._removeFocusListeners();
    }

    public popUpContent() {
        if (!this.show) {
            this.show = true;
            this._focusState = 'focused';
            this._addFocusListeners();
        }

        if (this.hideAfter) {
            this._setHideAfterTimer();
        }
    }

    public onKeyPress(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.enter) {
            this.popUpContent();
        }
    }

    private _setHideAfterTimer() {
        this._clearHideAfterTimer();
        this._hideAfterTimer =
            window.setTimeout(() => {
                this._hide();
            }, this.hideAfter);
    }

    private _clearHideAfterTimer() {
        if (this._hideAfterTimer !== null) {
            window.clearTimeout(this._hideAfterTimer);
            this._hideAfterTimer = null;
        }
    }

    private _hide() {
        this.show = false;
        this._removeFocusListeners();
        this._clearHideAfterTimer();
    }


    private _onBlur(event: any) {
        // This gets called when focus leaves the overall component. It will only be called after popUpContent().
        // If _hideAfterTimer is running, then it will take care of hiding the pop-over. Without this check,
        // _onBlur() will always hide the pop-over right away instead of honoring _hideAfterTimer.
        if (this._hideAfterTimer === null) {

            // At this point the focus will probably be somewhere on the page, outside of the component, so we shouldn't
            // have to worry about moving the focus off of the content element before hiding it.
            // However, we need to handle the scenario where the window has lost focus (as opposed to focus moving within
            // the page). In that case, we make sure to move the focus to the button element before hiding the content.
            if (this._contentHasFocus()) {
                this._moveFocusToButton();
            }

            this._hide();
        }
    }

    private _blurListener(event: FocusEvent) {
        this._focusState = 'blurring';
        setTimeout(() => {
            if (this._focusState !== 'focused') {
                this._focusState = 'blurred';
                this._onBlur(event);
            }
        });
    }

    private _focusListener(event: FocusEvent) {
        this._focusState = 'focused';
        // If focus is explicitly moved to anywhere in the popover conent element, make sure to revert to the non-"hideAfter" behavior.
        if (this._contentHasFocus()) {
            this._clearHideAfterTimer();
        }
    }

    private _addFocusListeners() {
        if (this.container && this.container.nativeElement) {
            this.container.nativeElement.addEventListener('focus', this._focusFunc, true);
            this.container.nativeElement.addEventListener('blur', this._blurFunc, true);
        }
    }

    private _removeFocusListeners() {
        if (this.container && this.container.nativeElement) {
            this.container.nativeElement.removeEventListener('focus', this._focusFunc, true);
            this.container.nativeElement.removeEventListener('blur', this._blurFunc, true);
        }
    }

    private _contentHasFocus(): boolean {
        return this.content && this.content.nativeElement && (this.content.nativeElement as HTMLElement).contains(document.activeElement);
    }

    private _moveFocusToButton() {
        if (this.button && this.button.nativeElement) {
            (this.button.nativeElement as HTMLElement).focus();
        }
    }
}
