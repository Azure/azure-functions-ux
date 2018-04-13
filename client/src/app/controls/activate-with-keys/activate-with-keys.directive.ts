import { Input, ElementRef, Directive, OnInit, OnDestroy } from '@angular/core';
import { KeyCodes } from './../../shared/models/constants';

@Directive({
    selector: '[activate-with-keys]',
})
export class ActivateWithKeysDirective implements OnInit, OnDestroy {

    constructor(private _elementRef: ElementRef) {
    }

    private _keyCodes:Array<number> = [KeyCodes.enter];

    @Input('activate-with-keys') set keyCodes(keys: Array<'enter' | 'space'>) {
        this._keyCodes = [];
        keys.forEach(key => {
            switch (key) {
                case 'enter':
                    this._keyCodes.push(KeyCodes.enter);
                    break;
                case 'space':
                    this._keyCodes.push(KeyCodes.space);
                    break;
                default:
                    break;
            }
        })
    }

    private _keyPressFunc = (event: KeyboardEvent) => { this._keyPressListener(event); };

    private _keyPressListener(event: KeyboardEvent) {
        if (this._keyCodes && this._keyCodes.findIndex(k => k === event.keyCode) !== -1) {
            if (this._elementRef && this._elementRef.nativeElement) {
                (this._elementRef.nativeElement as HTMLElement).click();
            }
        }
    }

    ngOnInit() {
        if (this._elementRef && this._elementRef.nativeElement) {
            this._elementRef.nativeElement.addEventListener('keypress', this._keyPressFunc, true);
        }
    }

    ngOnDestroy() {
        if (this._elementRef && this._elementRef.nativeElement) {
            this._elementRef.nativeElement.removeEventListener('keypress', this._keyPressFunc, true);
        }
    }
}
