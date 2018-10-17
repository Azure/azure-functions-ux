import { TblComponent } from './../../controls/tbl/tbl.component';
import { Component, ViewChild } from '@angular/core';
import { HighlightService } from '../highlight.service';

@Component({
  selector: 'tbl-example',
  styleUrls: ['./tbl-example.component.scss'],
  templateUrl: './tbl-example.component.html',
})
export class TblExampleComponent {
  @ViewChild('table')
  table: TblComponent;

  itemsToRender = [
    {
      name: 'a',
      value: '1',
    },
    {
      name: 'b',
      value: '2',
    },
    {
      name: 'c',
      value: '3',
    },
  ];

  constructor(highlightService: HighlightService) {
    this.htmlCode = highlightService.highlightString(this.htmlCode, 'html');
    this.typescriptCode = highlightService.highlightString(this.typescriptCode, 'typescript');
  }

  // tslint:disable-next-line:member-ordering
  public htmlCode = `
    <tbl [items]="itemsToRender" #table="tbl" name="Simple table">
        <tr>
            <th><tbl-th name="name">Sortable header</tbl-th></th>
            <th>Non-sortable header</th>
        </tr>
        
        <tr *ngFor="let item of table.items">
        <!-- NOTE: each row iterates over the items copy on the table element (table.items) -->
            <td>{{item.name}}</td>
            <td>{{item.value}}</td>
        </tr>
    </tbl>`;
  // tslint:disable-next-line:member-ordering
  public typescriptCode = `
    export class TblExampleComponent {
        @ViewChild('table') table: TblComponent;
    
        itemsToRender: { name: string, value: string }[];
    
        constructor() {
            this.itemsToRender = [{
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
      `;
}
