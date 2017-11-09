import { TblComponent } from './../../controls/tbl/tbl.component';
import { Component, ViewChild } from '@angular/core';

@Component({
    selector: 'tbl-example',
    styleUrls: ['./tbl-example.component.scss'],
    templateUrl: './tbl-example.component.html'
})
export class TblExampleComponent {
    @ViewChild('table') table: TblComponent;

    items: { name: string, value: string }[];

    constructor() {
        this.items = [{
            name: 'a',
            value: '1'
        },
        {
            name: 'b',
            value: '2'
        },
        {
            name: 'c',
            value: '3'
        }];
    }
}
