import { Component, Input } from '@angular/core';

@Component({
    selector: 'config-section',
    templateUrl: './config-section.component.html',
    styleUrls: ['./../site-config.component.scss']
})
export class ConfigSectionComponent {
    @Input() name: string;
    @Input() warningMessage: string;
    @Input() errorMessage: string;
    @Input() isFirstSection: boolean;
}