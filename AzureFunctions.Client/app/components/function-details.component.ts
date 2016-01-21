import {Component} from 'angular2/core';

Component({
    template: `
    <h2>hello details {{functionName}}</h2`,
    inputs: ['functionName']
})
export class FunctionDetailsComponent {
    public functionName: string;
}