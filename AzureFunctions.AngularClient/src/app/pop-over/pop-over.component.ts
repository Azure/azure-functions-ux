import { Component, Input } from '@angular/core';
import { KeyCodes } from '../shared/models/constants';

@Component({
    selector: 'pop-over',
    templateUrl: './pop-over.component.html',
    styleUrls: ['./pop-over.component.scss']
})
export class PopOverComponent {

    @Input() message: string;
    @Input() hideAfter: number;
    @Input() isInputError: boolean;
    @Input() isInputWarning: boolean;
    @Input() popOverClass = 'pop-over-container';
    @Input() position: string;
    @Input() isShiftTabPressed: boolean;

    public show: boolean;

    constructor() { }

    onBlur(event: any) {
        // blur() will always be called after focus(). If there is a hideAfter, then focus() will
        // take care of hiding the pop-over. Without this, blur will always hide the pop-over
        // right away ignoring hideAfter.
        if (!this.hideAfter) {
            this.show = false;
        }

        // Pressing Shift + Tab causes the links to open
        if (!this.isShiftTabPressed && event.relatedTarget && this.validURL(event.relatedTarget)) {
            window.open(
                event.relatedTarget.toString(),
                '_blank' // <- This is what makes it open in a new window.
            );
        }
        this.isShiftTabPressed = false;
    }

    popUpContent() {
        this.show = true;
        if (this.hideAfter) {
            setTimeout(() => {
                this.show = false;
            }, this.hideAfter);
        }
    }

    onKeyPress(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.tab && event.shiftKey === true) {
            this.isShiftTabPressed = true;
        }
        if (event.keyCode === KeyCodes.enter) {
            this.popUpContent();
        }
    }

    // http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url
    private validURL(str): boolean {
        const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locater

        if (!pattern.test(str)) {
            return false;
        } else {
            return true;
        }
    }
}
