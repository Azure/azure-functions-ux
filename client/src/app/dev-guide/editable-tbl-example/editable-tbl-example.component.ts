import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { TblComponent } from './../../controls/tbl/tbl.component';
import { Component, ViewChild } from '@angular/core';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { HighlightService } from '../highlight.service';

@Component({
    selector: 'editable-tbl-example',
    styleUrls: ['./editable-tbl-example.component.scss'],
    templateUrl: './editable-tbl-example.component.html'
})
export class EditableTblExampleComponent {
    @ViewChild('table') table: TblComponent;

    public groupArray: FormArray;

    constructor(private _fb: FormBuilder, private _translateService: TranslateService, highlightService: HighlightService) {
        this.groupArray = this._fb.array([]);
        const requiredValidator = new RequiredValidator(this._translateService);

        this.groupArray.push(this._fb.group({
            name: ['a', requiredValidator.validate.bind(requiredValidator)],
            value: ['1', requiredValidator.validate.bind(requiredValidator)]
        }));

        this.groupArray.push(this._fb.group({
            name: ['b', requiredValidator.validate.bind(requiredValidator)],
            value: ['2', requiredValidator.validate.bind(requiredValidator)]
        }));

        this.groupArray.push(this._fb.group({
            name: ['c', requiredValidator.validate.bind(requiredValidator)],
            value: ['3', requiredValidator.validate.bind(requiredValidator)]
        }));
        this.htmlCode = highlightService.highlightString(this.htmlCode, 'html');
        this.typescriptCode = highlightService.highlightString(this.typescriptCode, 'typescript');
    }

        // tslint:disable-next-line:member-ordering
        public htmlCode = `
    <tbl [items]="groupArray.controls" #table="tbl" name="Editable table">
        <tr><th colspan="2"></th></tr>
        <tr *ngFor="let group of table.items">
            <td>
                <click-to-edit [group]="group" name="name">
                    <textbox [control]="group.controls['name']"></textbox>
                </click-to-edit>
            </td>
            <td>
                <click-to-edit [group]="group" name="value">
                    <textbox [control]="group.controls['value']"></textbox>
                </click-to-edit>
                </td>
            </tr>
    </tbl>`;
        // tslint:disable-next-line:member-ordering
        public typescriptCode = `
        export class EditableTblExampleComponent {
            @ViewChild('table') table: TblComponent;
        
            public groupArray: FormArray;
        
            constructor(private _fb: FormBuilder, private _translateService: TranslateService) {
                this.groupArray = this._fb.array([]);
                const requiredValidator = new RequiredValidator(this._translateService);
        
                this.groupArray.push(this._fb.group({
                    name: ['a', requiredValidator.validate.bind(requiredValidator)],
                    value: ['1', requiredValidator.validate.bind(requiredValidator)]
                }));
        
                this.groupArray.push(this._fb.group({
                    name: ['b', requiredValidator.validate.bind(requiredValidator)],
                    value: ['2', requiredValidator.validate.bind(requiredValidator)]
                }));
        
                this.groupArray.push(this._fb.group({
                    name: ['c', requiredValidator.validate.bind(requiredValidator)],
                    value: ['3', requiredValidator.validate.bind(requiredValidator)]
                }));
            }
        }
          `;
}
