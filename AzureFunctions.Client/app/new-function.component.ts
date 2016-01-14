import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from './functions.service';
import {FunctionTemplate} from './function-template';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'new-function',
    templateUrl: 'templates/new-function.html',
    outputs: ['functionAdded']
})
export class NewFunctionComponent implements OnInit {
    public functionTemplates: Observable<FunctionTemplate[]>;
    public selectedTemplateName: string;
    public newFunctionName: string;
    public creating: boolean;
    private functionAdded: EventEmitter<boolean>;

    constructor(private _functionsService: FunctionsService) {
        this.functionAdded = new EventEmitter<boolean>();
    }

    ngOnInit() {
        this.functionTemplates = this._functionsService.getTemplates();
    }

    createFunction() {
        this.creating = true;
        this._functionsService.createFunction(this.newFunctionName, this.selectedTemplateName)
            .subscribe(res => {
                this.functionAdded.next(true);
                this.creating = false;
            });
    }
}