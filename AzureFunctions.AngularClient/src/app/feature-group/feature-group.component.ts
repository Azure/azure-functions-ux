import { Dom } from './../shared/Utilities/dom';
import { KeyCodes } from './../shared/models/constants';
import { Component, ViewChild, ElementRef } from '@angular/core';

import { AiService } from './../shared/services/ai.service';
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
    public searchTerm = '';
    private _focusedFeatureIndex = 0;

    @ViewChild('featureGroup') groupElement: ElementRef;

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
        });
    }

    click(feature: FeatureItem) {

        this._aiService.trackEvent('/site/feature-click', {
            featureName: feature.title,
            isResultsFiltered: !!this.searchTerm ? 'true' : 'false'
        });

        feature.click();
    }

    _getFeatures() {
        return this.groupElement.nativeElement.children;
    }

    _clearFocusOnFeature(featureElements: HTMLCollection, index: number) {
        const oldFeature = Dom.getTabbableControl(<HTMLElement>featureElements[index]);
        this.group.features[index].nameFocusable = false;
        Dom.clearFocus(oldFeature);
    }

    _setFocusOnFeature(featureElements: HTMLCollection, index: number) {
        let finalIndex = -1;
        let destFeature: Element;

        if (index >= 0 && index < featureElements.length) {
            finalIndex = index;
            destFeature = featureElements[index].children[0].children[1].children[0];
        } else if (featureElements.length > 0) {
            if (index === -1) {
                finalIndex = 0;
                destFeature = featureElements[0].children[0].children[1].children[0];
            } else {
                finalIndex = featureElements.length - 1;
                destFeature = featureElements[finalIndex].children[0].children[1].children[0];
            }
        }

        if (destFeature) {
            const newFeature = Dom.getTabbableControl(<HTMLElement>destFeature);
            this.group.features[finalIndex].nameFocusable = true;
            Dom.setFocus(<HTMLElement>newFeature);
        }

        this._focusedFeatureIndex = finalIndex;
    }

    onKeyPress(event: KeyboardEvent, feature: FeatureItem) {
        if (event.keyCode === KeyCodes.enter) {
            this.click(feature);

        } else if (event.keyCode === KeyCodes.arrowDown) {
            const featureElements = this._getFeatures();
            this._clearFocusOnFeature(featureElements, this._focusedFeatureIndex);
            this._setFocusOnFeature(featureElements, this._focusedFeatureIndex + 1);
            event.preventDefault();

        } else if (event.keyCode === KeyCodes.arrowUp) {
            const featureElements = this._getFeatures();
            this._clearFocusOnFeature(featureElements, this._focusedFeatureIndex);
            this._setFocusOnFeature(featureElements, this._focusedFeatureIndex - 1);
            event.preventDefault();

        }
    }
}
