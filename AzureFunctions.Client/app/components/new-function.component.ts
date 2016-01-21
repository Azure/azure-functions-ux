import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {FunctionTemplate} from '../models/function-template';
import {NewFunctionModel} from '../models/new-function-model';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'new-function',
    templateUrl: 'templates/new-function.html',
    outputs: ['functionAdded']
})
export class NewFunctionComponent implements OnInit {
    public functionTemplates: FunctionTemplate[];
    public contentSources: string[];
    public languages: string[];
    public triggers: { [id: string]: string[] };
    public model: NewFunctionModel;
    public creating: boolean;
    private functionAdded: EventEmitter<boolean>;


    constructor(private _functionsService: FunctionsService) {
        this.functionAdded = new EventEmitter<boolean>();
        this.model = {};
        this.triggers = {};
        this.contentSources = ['Empty', 'From Template', 'From Zip'];
    }

    getSelectedTamplate(): FunctionTemplate {
        return this.functionTemplates
            .find(e => e.language === this.model.selectedLanguage &&
                       e.trigger === this.model.selectedTrigger);
    }

    ngOnInit() {
        this._functionsService.getTemplates()
            .subscribe(res => {
                this.functionTemplates = res;
                this.languages = this.functionTemplates
                    .map(e => e.language)
                    .reduce((arr, e) => arr.indexOf(e) === -1 ? arr.concat(e) : arr, []);
                for (var i = 0; i < this.languages.length; i++) {
                    this.triggers[this.languages[i]] = this.functionTemplates
                        .filter(e => e.language === this.languages[i])
                        .map(e => e.trigger)
                        .reduce((arr, e) => arr.indexOf(e) === -1 ? arr.concat(e) : arr, []);
                }
            });
    }

    createFunction() {
        this.creating = true;
        this._functionsService.createFunction(this.model.functionName, this.getSelectedTamplate().id)
            .subscribe(res => {
                this.functionAdded.next(true);
                this.creating = false;
            });
    }

    selectedContentSourceChanged() {
        delete this.model.selectedLanguage;
        delete this.model.selectedTrigger;
    }

    selectedLanguageChanged() {
        delete this.model.selectedTrigger;
    }
}