import { TranslateService } from '@ngx-translate/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { TblComponent } from './../../controls/tbl/tbl.component';
import { Component, ViewChild } from '@angular/core';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';

@Component({
    selector: 'editable-tbl-example',
    styleUrls: ['./editable-tbl-example.component.scss'],
    templateUrl: './editable-tbl-example.component.html'
})
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
