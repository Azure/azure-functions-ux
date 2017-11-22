import { Dom } from './../shared/Utilities/dom';
import { KeyCodes } from './../shared/models/constants';
import { Component, ViewChild, ElementRef, Input } from '@angular/core';

import { AiService } from './../shared/services/ai.service';
import { FeatureGroup } from './feature-group';
import { FeatureItem } from './feature-item';

@Component({
    selector: 'feature-group',
    templateUrl: './feature-group.component.html',
    styleUrls: ['./feature-group.component.scss']
})
export class FeatureGroupComponent {
    public group: FeatureGroup;
    public searchTerm = '';
    private _focusedFeatureIndex = 0;

    @ViewChild('featureGroup') groupElement: ElementRef;

    constructor(private _aiService: AiService) {
    }

    @Input()
    set inputGroup(group: FeatureGroup) {
        this.group = group;
        this.group.features.forEach(f => f.keywords = f.keywords.toLowerCase());
    }

    @Input()
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
        this.group.features[index].imageFocusable = false;
        this.group.features[index].onName = false;
        this.group.features[index].onImage = false;
        Dom.clearFocus(oldFeature);
    }

    _setFocusOnFeature(featureElements: HTMLCollection, index: number) {
        let finalIndex = -1;
        let destFeature: Element;

        if (featureElements.length > 0) {
            finalIndex = Math.max(0, Math.min(index, featureElements.length - 1));
            destFeature = featureElements[finalIndex];
        }

        this._focusedFeatureIndex = finalIndex;

        if (destFeature) {
            const newFeature = Dom.getTabbableControl(<HTMLElement>destFeature);
            this.group.features[finalIndex].nameFocusable = true;
            this.group.features[finalIndex].imageFocusable = true;
            this.group.features[finalIndex].onName = true;
            this.group.features[finalIndex].onImage = false;
            Dom.setFocus(<HTMLElement>newFeature);
        }
    }

    onKeyPress(event: KeyboardEvent, feature: FeatureItem) {
        //  Enter to click the feature
        if (event.keyCode === KeyCodes.enter) {
            this.click(feature);

            // Arrow down to focus on the feature below current feature
        } else if (event.keyCode === KeyCodes.arrowDown) {
            const featureElements = this._getFeatures();
            this._clearFocusOnFeature(featureElements, this._focusedFeatureIndex);
            this._setFocusOnFeature(featureElements, this._focusedFeatureIndex + 1);
            event.preventDefault();

            // Arrow up to focus on the feature above the current feature
        } else if (event.keyCode === KeyCodes.arrowUp) {
            const featureElements = this._getFeatures();
            this._clearFocusOnFeature(featureElements, this._focusedFeatureIndex);
            this._setFocusOnFeature(featureElements, this._focusedFeatureIndex - 1);
            event.preventDefault();

            // Shift & tab to tab backwards and remove image from appearing in previous list
        } else if (event.keyCode === (KeyCodes.tab && KeyCodes.shiftLeft)) {
            if (!this.group.features[this._focusedFeatureIndex].onImage) {
                this.group.features.forEach(indexFeature => { indexFeature.onImage = false; indexFeature.imageFocusable = false; });
            }

            // Tab to tab forward and remove image from appearing in pervious list if or set onImage property
        } else if (event.keyCode === KeyCodes.tab) {
            if (this.group.features[this._focusedFeatureIndex].onImage) {
                this.group.features.forEach(indexFeature => { indexFeature.onImage = false; indexFeature.imageFocusable = false; });
            } else if (this.group.features[this._focusedFeatureIndex].onName) {
                this.group.features[this._focusedFeatureIndex].onImage = true;
            }
        }
    }

    checkFeatureGroupBlur() {
        // Only one info image should be shown at a time. If focus is lost to the group the info image will vanish
        if (!this.group.features[this._focusedFeatureIndex].onName && !this.group.features[this._focusedFeatureIndex].onImage) {
            this.group.features[this._focusedFeatureIndex].imageFocusable = false;
        }
    }

    nameFocus(feature: FeatureItem) {
        // If you click on an item it should be the tabbable item in the list
        this._focusedFeatureIndex = this.group.features.findIndex(f => f.title === feature.title);
        this.group.features.filter((f, index) => index !== this._focusedFeatureIndex).forEach(f => f.nameFocusable = false);

        this.group.features[this._focusedFeatureIndex].nameFocusable = true;
        this.group.features[this._focusedFeatureIndex].imageFocusable = true;
        this.group.features[this._focusedFeatureIndex].onName = true;
        this.group.features[this._focusedFeatureIndex].onImage = false;
    }

    imageFocus(feature: FeatureItem) {
        // If you click on an icon the item should become the tabbable item in the list
        this._focusedFeatureIndex = this.group.features.findIndex(f => f.title === feature.title);
        this.group.features.filter((f, index) => index !== this._focusedFeatureIndex).forEach(f => f.imageFocusable = false);

        this.group.features[this._focusedFeatureIndex].nameFocusable = true;
        this.group.features[this._focusedFeatureIndex].imageFocusable = true;
        this.group.features[this._focusedFeatureIndex].onName = false;
        this.group.features[this._focusedFeatureIndex].onImage = true;
    }
}
