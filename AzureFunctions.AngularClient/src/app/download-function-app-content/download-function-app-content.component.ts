import { PortalResources } from './../shared/models/portal-resources';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from './../shared/models/select-option';
import { Subject } from 'rxjs/Subject';
import { Component, Input, Output } from '@angular/core';

type DownloadOption = 'siteContent' | 'vsProject';

@Component({
  selector: 'download-function-app-content',
  templateUrl: './download-function-app-content.component.html',
  styleUrls: ['./download-function-app-content.component.scss']
})
export class DownloadFunctionAppContentComponent {
  @Input() public scmUrl: string;
  @Output() public close: Subject<boolean>;

  public downloadOptions: SelectOption<DownloadOption>[];
  public currentDownloadOption: DownloadOption;
  public includeAppSettings: boolean;

  constructor(private _translateService: TranslateService) {
    this.close = new Subject<boolean>();
    this.downloadOptions = [{
      displayLabel: this._translateService.instant(PortalResources.downloadFunctionAppContent_siteContent),
      value: 'siteContent'
    }, {
      displayLabel: this._translateService.instant(PortalResources.downloadFunctionAppContent_vsProject),
      value: 'vsProject'
    }];
    this.includeAppSettings = false;
    this.currentDownloadOption = 'siteContent';
  }

  downloadFunctionAppContent() {
    const includeCsProj = this.currentDownloadOption === 'siteContent' ? false : true;
    const url = `${this.scmUrl}/api/functions/admin/download?includeCsproj=${includeCsProj}&includeAppSettings=${this.includeAppSettings}`;
    window.open(url, '_blank');
  }

  closeModal() {
    this.close.next();
  }
}
