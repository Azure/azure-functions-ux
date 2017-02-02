import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {DropDownElement} from '../shared/models/drop-down-element';

@Component({
  selector: 'pop-over',
  templateUrl: './pop-over.component.html',
  styleUrls: ['./pop-over.component.css']
})
export class PopOverComponent {
    @Input() public message: string;
    @Input() hideAfter: number;
    @Input() isInputError: boolean;
    public show: boolean;
    @Input() public position: string;

    constructor() { }

    onBlur(event: any) {
        this.show = false;
        if (event.relatedTarget && this.validURL(event.relatedTarget)) {
            window.open(
                event.relatedTarget.toString(),
                '_blank' // <- This is what makes it open in a new window.
            );
        }
    }

    onFocus(event: Event) {
        this.show = true;

        if (this.hideAfter) {
            setTimeout(() => {
                this.show = false;
            }, this.hideAfter)
        }
    }

    //http://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-an-url
    private validURL(str): boolean {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
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