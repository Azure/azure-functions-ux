import { Component, Output, EventEmitter} from '@angular/core';
import { CacheService } from './../../shared/services/cache.service';


@Component({
    selector: 'subscription-plan-picker',
    templateUrl: './subscription-plan-picker.component.html',
    styleUrls: ['./subscription-plan-picker.component.scss']
})

export class SubscriptionPlanPickerComponent {
    @Output() planName: EventEmitter<string> = new EventEmitter<string>();
    @Output() invitationCodeRequired: EventEmitter<boolean> = new EventEmitter<boolean>();        
    plans: any[] = [];
    selectedPlan: string;

    constructor(
        private _cacheService: CacheService,
    ) {
        this._cacheService.getArm('/plans').subscribe(response => {
            this.plans = response.json().value;
        });
    }
    onTemplateClicked(name: string, invitationCodeRequired: boolean) {
        this.selectedPlan = name;
        this.planName.emit(name);
        this.invitationCodeRequired.emit(invitationCodeRequired);
    }
}
