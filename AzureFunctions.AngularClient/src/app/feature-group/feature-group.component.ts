import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs/Subject';

import { AiService } from './../shared/services/ai.service';
import { ArmService } from '../shared/services/arm.service';
import { SiteDescriptor } from '../shared/resourceDescriptors';
import { PopOverComponent } from '../pop-over/pop-over.component';
import { FeatureGroup } from './feature-group';
import { FeatureItem } from './feature-item';

@Component({
    selector: 'feature-group',
    templateUrl: './feature-group.component.html',
    styleUrls: ['./feature-group.component.scss'],
    inputs: ['inputGroup', 'searchTermInput']
})
export class FeatureGroupComponent {
    public group: FeatureGroup;
    public searchTerm = "";

    constructor(private _aiService: AiService) {
    }

    set inputGroup(group: FeatureGroup) {
        this.group = group;
        this.group.features.forEach(f => f.keywords = f.keywords.toLowerCase());
    }

    set searchTermInput(term: string) {
        this.searchTerm = term;
        term = term.toLowerCase();

        this.group.features.forEach(feature => {
            feature.highlight = feature.keywords.indexOf(term) > -1;
        })
    }

    click(feature: FeatureItem) {

        this._aiService.trackEvent("/site/feature-click", {
            featureName: feature.title,
            isResultsFiltered: !!this.searchTerm ? "true" : "false"
        })

        feature.click();
    }
}
