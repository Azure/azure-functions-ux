import { Component, Input, Injector } from "@angular/core";
import { FeatureComponent } from "../../../shared/components/feature-component";
import { ContainerConfigureInfo, Container } from "../container-settings";
import { Observable } from "rxjs/Observable";
import { ContainerSettingsManager } from "../container-settings-manager";

@Component({
    selector: 'container-configure',
    templateUrl: './container-configure.component.html',
    styleUrls: ['./container-configure.component.scss']
})
export class ContainerConfigureComponent extends FeatureComponent<ContainerConfigureInfo> {

    @Input() set containerConfigureInfoInput(containerConfigureInfo: ContainerConfigureInfo) {
        this.setInput(containerConfigureInfo);
    }

    public selectedContainer: Container;

    constructor(
        private _containerSettingsManager: ContainerSettingsManager,
        injector: Injector) {
        super('container-configure', injector, 'dashboard');
        this.featureName = 'ContainerSettingsComponent';

        this._containerSettingsManager.$selectedContainer.subscribe((selectedContainer: Container) => {
            this.selectedContainer = selectedContainer;
        });
    }

    protected setup(containerConfigureInfoInputEvent: Observable<ContainerConfigureInfo>) {
        return containerConfigureInfoInputEvent
            .do(containerConfigureInfo => {
            })
    }
}

export default ContainerConfigureComponent;
