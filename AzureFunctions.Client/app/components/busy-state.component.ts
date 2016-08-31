import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'busy-state',
    templateUrl: 'templates/busy-state.component.html',
    styleUrls: ['styles/busy-state.style.css']
})
export class BusyStateComponent implements OnInit {
    private busy: boolean = false;
    @Input() name: string;
    isGlobal: boolean = false;
    @Input() message: string;
    private inputBoltClass: string;
    private inputStoreClass: string;
    private leftBracketClass: string;
    private rightBracketClass: string;
    private outerFlashClass: string;
    private innerFlashClass: string;
    private inputArrowClass: string;
    private outputArrowClass: string;
    private outputStoreClass: string;
    private frame: number;

    ngOnInit() {
        this.isGlobal = this.name === 'global';
        this.inputBoltClass = "hide";
        this.inputStoreClass = "whiteFill";
        this.leftBracketClass = "fillNone";
        this.rightBracketClass = "fillNone";
        this.outerFlashClass = "fillNone";
        this.innerFlashClass = "fillNone";
        this.inputArrowClass = "whiteFill";
        this.outputArrowClass = "whiteFill";
        this.outputStoreClass= "whiteFill";
        this.nextStep();
    }

    setBusyState() {
        this.busy = true;
    }

    clearBusyState() {
        this.busy = false;
    }

    get isBusy(): boolean {
        return this.busy;
    }

    nextStep () {
        switch (this.frame) {
            case 0:
                {
                    this.inputBoltClass = "yellowFill";
                    this.inputStoreClass = "yellowFill";
                    this.frame++;
                    setTimeout(() => this.nextStep(), 100);
                    break;
                }
            case 1:
                {
                    this.inputBoltClass = "hide";
                    this.inputStoreClass = "whiteFill";
                    this.inputArrowClass = "yellowFill";
                    this.frame++;
                    setTimeout(() => this.nextStep(), 100);
                    break;
                }
            case 2:
                {
                    this.inputArrowClass = "whiteFill";
                    this.innerFlashClass = "orangeFill";
                    this.outerFlashClass = "yellowFill";
                    this.leftBracketClass = "yellowFill";
                    this.rightBracketClass = "orangeFill";

                    this.leftBracketClass = "orangeFill";
                    this.rightBracketClass = "yellowFill";
                    this.frame++;
                    setTimeout(() => this.nextStep(), 150);
                    break;
                }
            case 4:
            case 6:
                {
                    this.innerFlashClass = "orangeFill";
                    this.outerFlashClass = "yellowFill";

                    this.leftBracketClass = "orangeFill";
                    this.rightBracketClass = "yellowFill";
                    this.frame++;
                    setTimeout(() => this.nextStep(), 150);
                    break;
                }
            case 3:
            case 5:
                {
                    this.innerFlashClass = "yellowFill";
                    this.outerFlashClass = "orangeFill";

                    this.leftBracketClass = "yellowFill";
                    this.rightBracketClass = "orangeFill";
                    this.frame++;
                    setTimeout(() => this.nextStep(), 150);
                    break;
                }
            case 7:
                {
                    this.innerFlashClass = "fillNone";
                    this.outerFlashClass = "fillNone";
                    this.leftBracketClass = "fillNone";
                    this.rightBracketClass = "fillNone";
                   
                    this.outputArrowClass = "orangeFill";
                    this.outputStoreClass = "orangeFill";
                    this.frame++;
                    setTimeout(() => this.nextStep(), 150);
                    break;
                }
            default:
                {
                    this.outputArrowClass = "whiteFill";
                    this.outputStoreClass = "whiteFill";
                    this.frame = 0;
                    setTimeout(() => this.nextStep(), 5);
                    break;
                }
        }
    }

    private isIE(): boolean {
        return navigator.userAgent.toLocaleLowerCase().indexOf("trident") !== -1;
    }

}