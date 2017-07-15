import { Component, Input, Output } from '@angular/core';
import { Validators, ValidatorFn, FormControl, FormGroup, FormBuilder, FormArray} from '@angular/forms';
import { Subject } from 'rxjs/Subject';

export interface Pair {
    name: string;
    value: string;
}

export interface PairListOptions {
    items: Pair[];
    nameValidators?: ValidatorFn[];
    valueValidators?: ValidatorFn[];
} 

@Component({
    selector: 'pair-list',
    templateUrl: './pair-list.component.html',
    styleUrls: ['./pair-list.component.scss']
})
export class PairListComponent {

    @Input() addButtonLabel: string;

    @Input() warning: boolean = false;

    @Input() title: string;

    @Input() emptyLabel: string;

    @Output() valueChanges = new Subject<any>();

    form: FormGroup;

    private _options: PairListOptions;

    constructor(private _fb: FormBuilder) { }

    @Input('options') set options(value: PairListOptions) {
        this._options = value;
        var items = this._fb.array([]);
        value.items.forEach((item) => {
            items.push(this._fb.group({
                name: new FormControl(item.name, this._options.nameValidators ? this._options.nameValidators : []),
                value: new FormControl(item.value, this._options.valueValidators ? this._options.valueValidators : [])
            }));
        });

        this.form = this._fb.group({
            items: items
        });

        this.form.valueChanges.subscribe((r) => {
            this.valueChanges.next(this.form);
        });

        this.valueChanges.next(this.form);
    }

    removeItem(i: number) {
        const control = <FormArray>this.form.controls['items'];
        control.removeAt(i);
    }

    addItem() {
        const control = <FormArray>this.form.controls['items'];
        control.push(this._fb.group({
            name: new FormControl('', this._options.nameValidators ? this._options.nameValidators : []),
            value: new FormControl('', this._options.valueValidators ? this._options.valueValidators : [])
        }));
    }
}
