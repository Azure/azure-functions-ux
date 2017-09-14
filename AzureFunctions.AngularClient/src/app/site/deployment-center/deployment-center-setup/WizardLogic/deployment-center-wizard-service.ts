import {
    sourceControlProvider,
    DeploymentCenterSetupModel
} from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-setup-models';
import { Subject } from 'rxjs/Subject';

export class DeploymentCenterWizardService {
    public currentWizardState: DeploymentCenterSetupModel = new DeploymentCenterSetupModel();

    private sourceControlProviderSource = new Subject<sourceControlProvider>();
    private buildProviderSource = new Subject<sourceControlProvider>();

    sourceControlProvider$ = this.sourceControlProviderSource.asObservable();
    buildProvider$ = this.buildProviderSource.asObservable();

    public resourceIdStream = new Subject<string>();

    changeSourceControlProvider(provider: sourceControlProvider) {
        this.sourceControlProviderSource.next(provider);
        this.currentWizardState.sourceProvider = provider;
        this.currentWizardState.buildProvider = null;
    }

    changeBuildProvider(provider: sourceControlProvider) {
        this.buildProviderSource.next(provider);
        this.currentWizardState.buildProvider = provider;
    }
}
