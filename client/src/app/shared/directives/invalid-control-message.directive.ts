// based on https://hackernoon.com/create-reuseable-validation-directive-in-angualr-2-dcb0b0df2ce8
import { Directive, Input, OnInit, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { AbstractControl, ControlContainer, FormGroupDirective } from '@angular/forms';
import { Headers } from '@angular/http';
import { Observable, Subscription } from 'rxjs/Rx';
import { Guid } from '../Utilities/Guid';
import { CacheService } from '../services/cache.service';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../models/portal-resources';

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
    currentError: string;

    loadingElement: ElementRef;
    errorElement: ElementRef;
    errorTextElement: ElementRef;

    previousState: 'VALID' | 'INVALID' | 'PENDING' = 'VALID';
    constructor(
        private _fg: ControlContainer,
        private _el: ElementRef,
        private render: Renderer2,
        private _cacheService: CacheService,
        private _translateService: TranslateService
    ) {
    }

    ngOnInit() {

        if (this.invalidmessage === 'form-group') {
            this.control = this.form;
        } else {
            this.control = this.form.get(this.invalidmessage);
        }

        const formSubmit$ = (<FormGroupDirective>this._fg).ngSubmit.map(() => {
            this.hasSubmitted = true;
        });
        this._createLoadingElement();
        this._createErrorElement();
        this.render.appendChild(this._el.nativeElement, this.loadingElement);
        this.render.appendChild(this._el.nativeElement, this.errorElement);
        this.render.setStyle(this._el.nativeElement, 'margin-top', '5px');
        this.controlValue$ = Observable.merge(this.control.valueChanges, this.control.statusChanges, formSubmit$);
        this.controlSubscription = this.controlValue$.subscribe(() => {
            this.setVisible();
        });
    }

    private _createLoadingElement() {
        this.loadingElement = this.render.createElement('div');
        this.render.appendChild(this.loadingElement, this._getSpinnerElement());
        this.render.appendChild(this.loadingElement, this._getCenteredTextElement(this._translateService.instant(PortalResources.validating)));
        this.render.setStyle(this.loadingElement, 'display', 'none');

    }

    private _getSpinnerElement() {
        const spinnerElement = this.render.createElement('span');
        this.render.addClass(spinnerElement, 'icon-small');
        this.render.addClass(spinnerElement, 'fa-spin');
        this.render.setStyle(spinnerElement, 'margin-right', '5px');
        this._injectImageIntoImageElement(spinnerElement);
        return spinnerElement;
    }
    private _getCenteredTextElement(text: string) {
        const element = this.render.createElement('p');
        const textElement = this.render.createText(text);
        this.render.setStyle(element, 'display', 'inline-block');
        this.render.setStyle(element, 'vertical-align', 'middle');
        this.render.appendChild(element, textElement);
        return element;
    }
    private _createErrorElement() {
        this.errorElement = this.render.createElement('div');
        this.errorTextElement = this.render.createText('');
        this.render.appendChild(this.errorElement, this.errorTextElement);
        this.render.setStyle(this.loadingElement, 'display', 'none');
        this.render.addClass(this.errorElement, 'error-message');
    }

    private setVisible() {
        if (this.control.invalid && (this.control.dirty || this.control.touched || this.hasSubmitted)) {
            this.render.setStyle(this.loadingElement, 'display', 'none');
            this.render.removeStyle(this.errorElement, 'display');
            const errMessage = this.firstErrorMessage;
            this.render.removeChild(this.errorElement, this.errorTextElement);
            this.errorTextElement = this.render.createText(errMessage);
            this.render.appendChild(this.errorElement, this.errorTextElement);
        } else if (this.control.pending) {
            this.render.setStyle(this.errorElement, 'display', 'none');
            this.render.removeStyle(this.loadingElement, 'display');
        } else {
            this.render.setStyle(this.errorElement, 'display', 'none');
            this.render.setStyle(this.loadingElement, 'display', 'none');
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

    private _injectImageIntoImageElement(spinnerElement: any) {
        const headers = new Headers();
        headers.append('Accept', 'image/webp,image/apng,image/*,*/*;q=0.8');
        headers.append('x-ms-client-request-id', Guid.newGuid());
        this._cacheService.get(`image/spinner.svg?cacheBreak=${window.appsvc.cacheBreakQuery}`, false, headers)
            .subscribe(image => {
                spinnerElement.innerHTML = image.text();
            });
    }

}
