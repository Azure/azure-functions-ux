import {Component, OnInit, Input} from '@angular/core';
import {Observable, Subject, Subscription as RxSubscription} from 'rxjs/Rx';
import {AccordionElement} from './accordion-element';

@Component({
    selector: 'accordion',
    templateUrl: './accordion.component.html',
    inputs: ['wrapperClass', 'iconClass', 'titleName', 'titleText', 'elementsInput', 'level']
})
export class AccordionComponent {

    public expanded: boolean = false;
    public expandable: boolean = false;
    public elements: AccordionElement[];
    public level : string;
    public iconClass : string;

    private _elementsSubject = new Subject<AccordionElement[]>();

    constructor() {
        this._elementsSubject = new Subject<AccordionElement[]>();
        this._elementsSubject
            .distinctUntilChanged()
            .switchMap((elements: AccordionElement[]) => {
                this.expanded = false;
                this.expandable = false;
                this.elements = [];

                this.elements = elements;
                return Observable.of(null);
            })
            .subscribe(r => {
                this.expandable = (this.elements && this.elements.length > 0);
            });
    }

    public toggleExpand() {
        if (this.expandable === true) {
            this.expanded = !this.expanded;
        }
    }

    set elementsInput(elements: AccordionElement[]) {
        if (!elements) {
            return;
        }

        this._elementsSubject.next(elements);
    }
}