import {Component, OnInit, EventEmitter} from 'angular2/core';
import {FunctionsService} from '../services/functions.service';
import {FunctionTemplate} from '../models/function-template';
import {NewFunctionModel} from '../models/new-function-model';
import {FunctionInfo} from '../models/function-info';
import {Observable} from 'rxjs/Rx';
import {IBroadcastService, BroadcastEvent} from '../services/ibroadcast.service';

@Component({
    selector: 'function-new-v2',
    templateUrl: 'templates/function-new-v2.component.html'
})
export class FunctionNewV2Component implements OnInit {
    public functionTemplates: FunctionTemplate[];
    public contentSources: string[];
    public languages: string[];
    public triggers: { [id: string]: string[] };
    public model: NewFunctionModel;
    public creating: boolean;

    constructor(private _functionsService: FunctionsService,
                private _broadcastService: IBroadcastService) {
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
                window.setTimeout(() => {
                    this._broadcastService.broadcast(BroadcastEvent.FunctionAdded, res);
                    this.creating = false;
                }, 1500);
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