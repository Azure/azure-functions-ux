// based on https://hackernoon.com/create-reuseable-validation-directive-in-angualr-2-dcb0b0df2ce8
import { Directive, Input, OnInit, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { AbstractControl, ControlContainer, FormGroupDirective } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs/Rx';
import { LoadImageDirective } from '../../controls/load-image/load-image.directive';
import { PortalResources } from '../models/portal-resources';
import { CacheService } from '../services/cache.service';
import { LogService } from '../services/log.service';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[invalidmessage]',
})
export class InvalidmessageDirective implements OnInit, OnDestroy {
  @Input()
  invalidmessage: string;
  @Input()
  errorkey: string;
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
    private _translateService: TranslateService,
    private _logService: LogService
  ) {}

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
    this.render.addClass(this._el.nativeElement, 'validation-container');
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
    LoadImageDirective.injectImageToElement('image/spinner.svg', spinnerElement, this._cacheService, this._logService);
    return spinnerElement;
  }
  private _getCenteredTextElement(text: string) {
    const element = this.render.createElement('p');
    const textElement = this.render.createText(text);
    this.render.addClass(element, 'centered-validating-text');
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
      const errMessage = this.firstOrSpecifiedErrorMessage;
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

  get firstOrSpecifiedErrorMessage(): string {
    if (this.control && this.control.errors && Object.keys(this.control.errors).length > 0) {
      if (!!this.errorkey) {
        return this.control.errors[this.errorkey] || '';
      } else {
        return this.control.errors[Object.keys(this.control.errors)[0]];
      }
    }
    return '';
  }

  get form() {
    return this._fg.formDirective ? (this._fg.formDirective as FormGroupDirective).form : null;
  }

  ngOnDestroy() {
    this.controlSubscription.unsubscribe();
  }
}
