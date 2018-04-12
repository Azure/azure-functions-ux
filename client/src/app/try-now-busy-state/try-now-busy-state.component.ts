import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'try-now-busy-state',
    templateUrl: './try-now-busy-state.component.html',
    styleUrls: ['./try-now-busy-state.component.css']
})
export class TryNowBusyStateComponent implements OnInit {
    public inputBoltClass: string;
    public inputStoreClass: string;
    public leftBracketClass: string;
    public rightBracketClass: string;
    public outerFlashClass: string;
    public innerFlashClass: string;
    public inputArrowClass: string;
    public outputArrowClass: string;
    public outputStoreClass: string;
    private frame: number;
    public isIE: boolean;

    ngOnInit() {
        this.isIE = navigator.userAgent.toLocaleLowerCase().indexOf('trident') !== -1;
        this.inputBoltClass = 'hide';
        this.inputStoreClass = 'whiteFill';
        this.leftBracketClass = 'fillNone';
        this.rightBracketClass = 'fillNone';
        this.outerFlashClass = 'fillNone';
        this.innerFlashClass = 'fillNone';
        this.inputArrowClass = 'whiteFill';
        this.outputArrowClass = 'whiteFill';
        this.outputStoreClass = 'whiteFill';
        this.nextStep();
    }

    nextStep() {
        switch (this.frame) {
            case 0:
                {
                    this.inputBoltClass = 'yellowFill';
                    this.inputStoreClass = 'yellowFill';
                    this.frame++;
                    setTimeout(() => this.nextStep(), 100);
                    break;
                }
            case 1:
                {
                    this.inputBoltClass = 'hide';
                    this.inputStoreClass = 'whiteFill';
                    this.inputArrowClass = 'yellowFill';
                    this.frame++;
                    setTimeout(() => this.nextStep(), 100);
                    break;
                }
            case 2:
                {
                    this.inputArrowClass = 'whiteFill';
                    this.innerFlashClass = 'orangeFill';
                    this.outerFlashClass = 'yellowFill';
                    this.leftBracketClass = 'yellowFill';
                    this.rightBracketClass = 'orangeFill';

                    this.leftBracketClass = 'orangeFill';
                    this.rightBracketClass = 'yellowFill';
                    this.frame++;
                    setTimeout(() => this.nextStep(), 150);
                    break;
                }
            case 4:
            case 6:
                {
                    this.innerFlashClass = 'orangeFill';
                    this.outerFlashClass = 'yellowFill';

                    this.leftBracketClass = 'orangeFill';
                    this.rightBracketClass = 'yellowFill';
                    this.frame++;
                    setTimeout(() => this.nextStep(), 150);
                    break;
                }
            case 3:
            case 5:
                {
                    this.innerFlashClass = 'yellowFill';
                    this.outerFlashClass = 'orangeFill';

                    this.leftBracketClass = 'yellowFill';
                    this.rightBracketClass = 'orangeFill';
                    this.frame++;
                    setTimeout(() => this.nextStep(), 150);
                    break;
                }
            case 7:
                {
                    this.innerFlashClass = 'fillNone';
                    this.outerFlashClass = 'fillNone';
                    this.leftBracketClass = 'fillNone';
                    this.rightBracketClass = 'fillNone';

                    this.outputArrowClass = 'orangeFill';
                    this.outputStoreClass = 'orangeFill';
                    this.frame++;
                    setTimeout(() => this.nextStep(), 150);
                    break;
                }
            default:
                {
                    this.outputArrowClass = 'whiteFill';
                    this.outputStoreClass = 'whiteFill';
                    this.frame = 0;
                    setTimeout(() => this.nextStep(), 5);
                    break;
                }
        }
    }
}
