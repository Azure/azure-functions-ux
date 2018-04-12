import { Guid } from './../../shared/Utilities/Guid';
import { KeyCodes } from './../../shared/models/constants';
import { PortalResources } from './../../shared/models/portal-resources';
import { Component, OnChanges, SimpleChanges, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';

type Role = undefined | 'switch' | 'button';

type LabelFormt = undefined | 'name' | 'stateName' | 'nameAndStateName' | 'mergedStateNames';

@Component({
    selector: 'slide-toggle',
    templateUrl: './slide-toggle.component.html',
    styleUrls: ['./slide-toggle.component.scss']
})
export class SlideToggleComponent implements OnChanges {

    @Output() change = new Subject<boolean>();
    @Input() disabled: boolean = false;
    @Input() on: boolean = false;
    @Input() isCommand: boolean = false;
    @Input() name: string;
    @Input() stateNames: { on: string, off: string };

    // The inputs 'displayLabelFormat' and 'ariaLabelFormat' are used for indicating the way 'name' and 'stateNames' should be used to
    // construct 'displayLabel' and 'ariaLabel'. These settings may not be honored depending on the value of 'role' and whether 'name'
    // and/or 'stateNames' are defined. This is handeled in _updateLabelAndAriaAttributes().

    // Format definitions:
    //  name -> this.name [when applied to aria-label, ' toggle' is appended]
    //  --------- if 'this.stateNames' defined ---------
    //   stateName        -> this.on ? this.stateNames.on : this.stateNames.off
    //   nameAndStateName -> this.name + ": " (this.on ? this.stateNames.on : this.stateNames.off)
    //   mergedStateNames -> this.stateNames.off + "/" + this.stateNames.on [when applied to aria-lable, ' toggle' is appended]
    //  ------ if 'this.stateNames' not defined ------
    //   stateName        -> this.on ? this.stateNames.on : this.stateNames.off
    //   nameAndStateName -> this.name + ": " (this.on ? this.stateNames.on : this.stateNames.off)
    //   mergedStateNames -> this.stateNames.off + "/" + this.stateNames.on [when applied to aria-lable, ' toggle' is appended]

    @Input() displayLabelFormat: LabelFormt;

    //If role is 'switch', 'aria-label' should stay constant, so only 'name' and 'mergedStateNames' will be honored
    @Input() ariaLabelFormat: LabelFormt;

    // We're restricting the 'role' attribute to 'switch' or 'button'.
    // If the control is being used to perform an action, the parent should pass a value of true to the 'isCommand' input, so the 'button' role is used.
    // Otherwise, the parent should pass a value of false to the 'isCommand' input or not beind to it, so the 'switch' role is used.

    //  NOTE: Testing with NVDA screen reader revealed the following issues with the 'switch' role:
    //   - Reader does not state the role. Only the 'aria-label' value and the 'aria-checked' status are read.
    //   - Reader only states the 'aria-checked' status when the value is true ('checked'). When the value is false ('not checked'), the status is not read.
    //  These issues don't occur when the 'checkbox' role is used, but using this role would technically be inorrect based on the usage of this control.
    public role: Role;

    public ariaLabel: string;

    // The 'aria-checked' attribute is REQUIRED for 'switch' role.
    public ariaChecked: boolean = null;

    // If 'aria-pressed' attribute does not apply to the 'switch' role and is optional for the 'button' role.
    // We should not use it if we are updating 'aria-label' whenever a toggle happens.
    // We should use it if we are using a constant value for 'aria-pressed'.
    public ariaPressed: boolean = null;
    public displayLabel: string;

    @Input() id: string;

    private _initialized: boolean = false;

    @ViewChild('toggleContainer') toggleContainer: ElementRef;

    constructor(private _translateService: TranslateService) {
        this.id = Guid.newGuid();
    }

    ngOnChanges(changes: SimpleChanges) {
        // These properties will only be set once, in the first execution of ngOnChanges().
        this.role = this.role || (this.isCommand ? 'button' : 'switch');
        this.displayLabelFormat = this.displayLabelFormat || 'stateName';
        this.ariaLabelFormat = this.ariaLabelFormat || 'name';

        if (!this._initialized || !!changes['on']) {
            this._updateLabelAndAriaAttributes();
        }

        this._initialized = true;
    }

    private _updateLabelAndAriaAttributes() {
        const stateNames = this._getStateNames();
        const state = this.on ? 1 : 0;

        switch (this.displayLabelFormat) {
            case 'name':
                // Use name if present. Otherwise fallback to current state name
                this.displayLabel = this.name || stateNames[state];
                break;
            case 'stateName':
                this.displayLabel = stateNames[state];
                break;
            case 'nameAndStateName':
                // If name is not present, fallback to only the current state name
                this.displayLabel = (this.name ? this.name + ': ' : '') + stateNames[state];
                break;
            case 'mergedStateNames':
                // If default state names are being used, fallback to name, then to current state name
                this.displayLabel = !stateNames.isFallback ? stateNames.combined : this.name || (stateNames[state]);
                break;
            default:
                break;
        }

        let ariaLabel: string = '';
        let ariaChecked: boolean = null;
        let ariaPressed: boolean = null;
        let addSuffix = false;

        if (this.role === 'button') {
            ariaPressed = null;
            switch (this.ariaLabelFormat) {
                case 'name':
                    // Use name if present. Otherwise fallback to current state name
                    if (this.name) {
                        addSuffix = true;
                        ariaLabel = this.name;
                        ariaPressed = this.on;
                    }
                    else {
                        ariaLabel = stateNames[state];
                    }
                    break;
                case 'stateName':
                    ariaLabel = stateNames[state];
                    break;
                case 'nameAndStateName':
                    // If name is not present, fallback to only the current state name
                    ariaLabel = (this.name ? this.name + ': ' : '') + stateNames[state];
                    break;
                case 'mergedStateNames':
                    // If default state names are being used, fallback to name, then to current state name
                    if (!stateNames.isFallback) {
                        addSuffix = true;
                        ariaLabel = stateNames.combined;
                        ariaPressed = this.on;
                    } else if (this.name) {
                        addSuffix = true;
                        ariaLabel = this.name;
                        ariaPressed = this.on;
                    } else {
                        ariaLabel = stateNames[state];
                    };
                    break;
                default:
                    break;
            }
        } else if (this.role === 'switch') {
            ariaChecked = this.on;
            switch (this.ariaLabelFormat) {
                case 'name':
                    // Use name if present. Otherwise fallback to merged state names
                    addSuffix = true;
                    ariaLabel = this.name || stateNames.combined;
                    break;
                case 'mergedStateNames':
                    // This doesn't really make sense if the default state names are being used, so just show that state name
                    addSuffix = true;
                    ariaLabel = stateNames.combined;
                    break;
                default:
                    break;
            }
        }

        this.ariaLabel = ariaLabel + (addSuffix ? ' toggle' : '');
        this.ariaPressed = ariaPressed;
        this.ariaChecked = ariaChecked;
    }

    private _getStateNames(): { [key: number]: string, isFallback: boolean, combined: string } {
        let stateNames: { [key: number]: string, isFallback: boolean, combined: string } = {
            isFallback: !this.stateNames || !this.stateNames.on || !this.stateNames.off,
            combined: ''
        };
        stateNames[0] = stateNames.isFallback ? this._translateService.instant(PortalResources.disabled) : this.stateNames.off;
        stateNames[1] = stateNames.isFallback ? this._translateService.instant(PortalResources.enabled) : this.stateNames.on;
        stateNames.combined = stateNames[0] + '/' + stateNames[1];

        return stateNames;
    }

    onClick(event: MouseEvent) {
        this._toggle();
    }

    onKeyPress(event: KeyboardEvent) {
        if (event.keyCode === KeyCodes.space) {
            this._toggle();
            event.preventDefault();
        }
    }

    private _toggle() {
        if (!this.disabled) {
            this.on = !this.on;
            this._updateLabelAndAriaAttributes();
            this.change.next(this.on);
        }
    }
}
