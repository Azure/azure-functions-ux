import { FeatureComponent } from 'app/shared/components/feature-component';
import { OnDestroy, Component } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-credentials-dashboard',
  templateUrl: './credentials-dashboard.component.html',
  styleUrls: ['./credentials-dashboard.component.scss', '../../deployment-center-setup/deployment-center-setup.component.scss'],
})
export class CredentialsDashboardComponent extends FeatureComponent<string> implements OnDestroy {
  private _ngUnsubscribe$ = new Subject();

  ngOnDestroy() {
    this._ngUnsubscribe$.next();
    super.ngOnDestroy();
  }
}
