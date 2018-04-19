import { Component, Input } from '@angular/core';

@Component({
    selector: 'pop-over',
    templateUrl: './pop-over.component.html',
    styleUrls: ['./pop-over.component.scss']
})
export class PopOverComponent {

    @Input() message: string;
    @Input() hideAfter: number;
    @Input() isInputError: boolean;
    @Input() popOverClass = 'pop-over-container';
    @Input() position: string;

    public show: boolean;

    constructor() { }

    onBlur(event: any) {
        // blur() will always be called after focus(). If there is a hideAfter, then focus() will
        // take care of hiding the pop-over. Without this, blur will always hide the pop-over
        // right away ignoring hideAfter.
        if (!this.hideAfter) {
            this.show = false;
        }
        if (event.relatedTarget && this.validURL(event.relatedTarget)) {
            window.open(
                event.relatedTarget.toString(),
                '_blank' // <- This is what makes it open in a new window.
            );
        }
    }

    onFocus(_: Event) {
        this.show = true;

        if (this.hideAfter) {
            setTimeout(() => {
                this.show = false;
            }, this.hideAfter);
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
