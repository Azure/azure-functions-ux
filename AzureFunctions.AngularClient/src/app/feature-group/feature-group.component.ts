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

    constructor(){}

    set inputGroup(group : FeatureGroup){
        this.group = group;
        this.filteredFeatures = this.group.features;
    }

    set searchTerm(term : string){
        if(!term){
            this.filteredFeatures = this.group.features;
        }

        let features : FeatureItem[] = [];
        this.group.features.forEach(feature =>{
            if(feature.keywords.toLowerCase().indexOf(term.toLowerCase()) > -1){
                features.push(feature);
            }
        })

        this.filteredFeatures = features;
    }

    click(feature : FeatureItem){
        feature.click();
    }
}