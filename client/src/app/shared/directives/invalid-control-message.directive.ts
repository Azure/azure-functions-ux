// based on https://hackernoon.com/create-reuseable-validation-directive-in-angualr-2-dcb0b0df2ce8
import { Directive, Input, OnInit, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { AbstractControl, ControlContainer, FormGroupDirective } from '@angular/forms';

import { Observable, Subscription } from 'rxjs/Rx';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[invalidmessage]'
})
export class InvalidmessageDirective implements OnInit, OnDestroy {
    @Input() invalidmessage: string;
    control: AbstractControl;
    hasView = false;
    controlValue$: Observable<any>;
    controlSubscription: Subscription;
    hasSubmitted: boolean;
    currentText: string;
    currentTextElement: ElementRef;
    constructor(
        private _fg: ControlContainer,
        private _el: ElementRef,
        private render: Renderer2
    ) { }

    ngOnInit() {
        this.render.addClass(this._el.nativeElement, 'error-message');
        this.control = this.form.get(this.invalidmessage);
        const formSubmit$ = (<FormGroupDirective>this._fg).ngSubmit.map(() => {
            this.hasSubmitted = true;
        });
        this.controlValue$ = Observable.merge(this.control.valueChanges, Observable.of(''), formSubmit$);
        this.controlSubscription = this.controlValue$.subscribe(() => {
            this.setVisible();
        });
    }

    private setVisible() {
        if (this.control.invalid && (this.control.touched || this.hasSubmitted)) {
            this.render.removeStyle(this._el.nativeElement, 'display');
            const errMessage = this.firstErrorMessage;
            if (!this.hasView || this.currentText !== errMessage) {
                if (this.currentTextElement) {
                    this.render.removeChild(this._el.nativeElement, this.currentTextElement);
                }
                this.currentTextElement = this.render.createText(errMessage);
                this.render.appendChild(this._el.nativeElement, this.currentTextElement);
            }
        } else {
            this.render.setStyle(this._el.nativeElement, 'display', 'none');
            if (this.currentTextElement) {
                this.render.removeChild(this._el.nativeElement, this.currentTextElement);
                this.currentTextElement = null;
            }
            this.hasView = false;
        }
    }

    get firstErrorMessage(): string {
        if (this.control && this.control.errors) {
            if (Object.keys(this.control.errors).length > 0) {
                return this.control.errors[Object.keys(this.control.errors)[0]];
            }
        }
        return '';
    }

    get form() { return this._fg.formDirective ? (this._fg.formDirective as FormGroupDirective).form : null; }

    ngOnDestroy() {
        this.controlSubscription.unsubscribe();
    }
}
