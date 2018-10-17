import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';

@Component({
  selector: 'app-add-slot-shell',
  templateUrl: './add-slot-shell.component.html',
  styleUrls: ['./add-slot-shell.component.scss'],
})
export class AddSlotShellComponent implements OnDestroy {
  resourceId: string;
  ngUnsubscribe: Subject<void>;

  constructor(translateService: TranslateService, route: ActivatedRoute) {
    this.ngUnsubscribe = new Subject<void>();

    route.params.takeUntil(this.ngUnsubscribe).subscribe(x => {
      this.resourceId = ArmSiteDescriptor.generateResourceUri(x['subscriptionId'], x['resourceGroup'], x['site'], x['slot']);
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
  }
}
