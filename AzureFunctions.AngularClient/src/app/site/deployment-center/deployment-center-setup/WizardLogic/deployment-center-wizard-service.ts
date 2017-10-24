import {
    sourceControlProvider,
    DeploymentCenterSetupModel
} from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-setup-models';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { MovingDirection } from 'app/controls/form-wizard/util/moving-direction.enum';

export class DeploymentCenterWizardService {
    public currentWizardState: DeploymentCenterSetupModel = new DeploymentCenterSetupModel();

    private sourceControlProviderSource = new ReplaySubject<sourceControlProvider>(1);
    private buildProviderSource = new ReplaySubject<sourceControlProvider>(1);
    public resourceIdStream = new ReplaySubject<string>(1);
    public StepExitListener = new Subject<{direction: MovingDirection, step: string}>();

    sourceControlProvider$ = this.sourceControlProviderSource.asObservable();
    buildProvider$ = this.buildProviderSource.asObservable();
    

    changeSourceControlProvider(provider: sourceControlProvider) {
        this.sourceControlProviderSource.next(provider);
        this.currentWizardState.sourceProvider = provider;
        this.changeBuildProvider(null);
    }

    changeBuildProvider(provider: sourceControlProvider) {
        this.buildProviderSource.next(provider);
        this.currentWizardState.buildProvider = provider;
    }
}
