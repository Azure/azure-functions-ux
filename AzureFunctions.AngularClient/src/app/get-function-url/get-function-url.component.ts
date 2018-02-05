import { Subject } from 'rxjs/Subject';
import { Component, Input, Output } from '@angular/core';
import { FunctionKeys } from '../shared/models/function-key';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
    selector: 'get-function-url',
    templateUrl: './get-function-url.component.html',
    styleUrls: ['./get-function-url.component.scss']
})
export class GetFunctionUrlComponent implements AfterViewInit {
    @ViewChild('keysBox') keysBox: ElementRef;

    @Input() public isHttpFunction: boolean;
    @Input() public functionKeys: FunctionKeys;
    @Input() public hostKeys: FunctionKeys;
    @Input() public functionInvokeUrl: string;
    @Input() public setKey: Subject<string>;

    @Output() public close: Subject<boolean>;

    constructor() {
        this.close = new Subject<boolean>();
    }

    closeModal() {
        this.close.next();
    }

    onChangeKey(key: string) {
        this.setKey.next(key);
    }

    ngAfterViewInit() {
        this.keysBox.nativeElement.focus();
    }
}
