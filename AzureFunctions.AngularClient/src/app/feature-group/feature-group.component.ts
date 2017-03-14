import { AiService } from './../shared/services/ai.service';
import {Component, OnInit, EventEmitter, Input, Output} from '@angular/core';
import {Observable, Subject} from 'rxjs/Rx';
import {ArmService} from '../shared/services/arm.service';
import {SiteDescriptor} from '../shared/resourceDescriptors';
import {PopOverComponent} from '../pop-over/pop-over.component';
import {FeatureGroup} from './feature-group';
import {FeatureItem} from './feature-item';

@Component({
    selector: 'feature-group',
    templateUrl: './feature-group.component.html',
    styleUrls: ['./feature-group.component.scss'],
    inputs : ['inputGroup', 'searchTerm']
})

export class FeatureGroupComponent {

    public filteredFeatures : FeatureItem[];
    public group : FeatureGroup;
    private _emptyItem : FeatureItem;
    private _searchTerm = "";

    constructor(private _aiService : AiService){
        this._emptyItem = new FeatureItem("", "", "");
        this._emptyItem.isEmpty = true;
    }

    set inputGroup(group : FeatureGroup){
        this.group = group;
        this.filteredFeatures = this.group.features;
    }

    set searchTerm(term : string){
        this._searchTerm = term;

        if(!term){
            this.filteredFeatures = this.group.features;
        }

        let features : FeatureItem[] = [];
        this.group.features.forEach(feature =>{
            if(feature.keywords.toLowerCase().indexOf(term.toLowerCase()) > -1){
                features.push(feature);
            }
        })

        let numEmptyItemsToAdd = 0;
        if(features.length === 0){
            numEmptyItemsToAdd = this.group.features.length;
        }
        else if(features.length !== this.group.features.length){
            numEmptyItemsToAdd = this.group.features.length - features.length;
        }

        for(let i = 0; i < numEmptyItemsToAdd; i++){
            features.push(this._emptyItem);
        }

        this.filteredFeatures = features;
    }

    click(feature : FeatureItem){
        
        this._aiService.trackEvent("/site/feature-click", {
            featureName : feature.title,
            isResultsFiltered : !!this._searchTerm ? "true" : "false"
        })

        feature.click();
    }
}