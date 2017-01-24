import {Component, ViewChild, Input, OnChanges, SimpleChange} from '@angular/core';
import {Observable, Subscription as RxSubscription} from 'rxjs/Rx';
import {Descriptor} from '../shared/resourceDescriptors';

@Component({
    selector: 'breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.scss'],
    inputs: ['descriptorInput']
})
export class BreadcrumbsComponent {
    public descriptor : Descriptor;

    constructor() {
    }

    set descriptorInput(descriptor : Descriptor){
        this.descriptor = descriptor;
    }
}