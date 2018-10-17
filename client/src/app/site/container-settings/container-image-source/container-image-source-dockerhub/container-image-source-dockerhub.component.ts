import { Component, Input, OnDestroy, Injector } from '@angular/core';
import { DockerHubAccessType, ContainerImageSourceData } from '../../container-settings';
import { ContainerSettingsManager } from '../../container-settings-manager';
import { FormGroup } from '@angular/forms';
import { FeatureComponent } from '../../../../shared/components/feature-component';
import { Observable } from 'rxjs/Observable';
import { ContainerMultiConfigService } from '../../services/container-multiconfig.service';

@Component({
  selector: 'container-image-source-dockerhub',
  templateUrl: './container-image-source-dockerhub.component.html',
  styleUrls: [
    './../../container-settings.component.scss',
    './../container-image-source.component.scss',
    './container-image-source-dockerhub.component.scss',
  ],
})
export class ContainerImageSourceDockerHubComponent extends FeatureComponent<ContainerImageSourceData> implements OnDestroy {
  @Input()
  set containerImageSourceInfoInput(containerImageSourceInfo: ContainerImageSourceData) {
    this.setInput(containerImageSourceInfo);
  }

  public containerImageSourceInfo: ContainerImageSourceData;
  public selectedAccessType: DockerHubAccessType;
  public imageSourceForm: FormGroup;
  public dockerHubForm: FormGroup;

  constructor(
    public containerSettingsManager: ContainerSettingsManager,
    private _multiConfigService: ContainerMultiConfigService,
    injector: Injector
  ) {
    super('ContainerImageSourceDockerHubComponent', injector, 'dashboard');
    this.featureName = 'ContainerSettings';
  }

  protected setup(inputEvents: Observable<ContainerImageSourceData>) {
    return inputEvents.distinctUntilChanged().do(containerImageSourceInfo => {
      this.containerImageSourceInfo = containerImageSourceInfo;
      this.imageSourceForm = containerImageSourceInfo.imageSourceForm;
      this.selectedAccessType = this.imageSourceForm.controls.accessType.value;
      this.dockerHubForm = this.containerSettingsManager.getDockerHubForm(this.imageSourceForm, this.selectedAccessType);
    });
  }

  public extractConfig(event) {
    this._multiConfigService
      .extractConfig(event.target)
      .first()
      .subscribe(config => {
        this.dockerHubForm.controls.config.setValue(config);
      });
  }

  public updateAccessOptions(accessType: DockerHubAccessType) {
    this.selectedAccessType = accessType;
    this.imageSourceForm.controls.accessType.setValue(accessType);
    this.dockerHubForm = this.containerSettingsManager.getDockerHubForm(this.imageSourceForm, this.selectedAccessType);
  }
}
