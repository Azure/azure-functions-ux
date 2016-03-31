import {Component, OnInit, EventEmitter} from 'angular2/core';
import {DropDownElement} from '../models/drop-down-element';

@Component({
    selector: 'pop-over',
    inputs:['message'],
    templateUrl: 'templates/pop-over.component.html',
    styleUrls: ['styles/pop-over.style.css']
})

export class PopOverComponent{
    public message : string;
    public show : boolean;

    constructor(){
    }
}