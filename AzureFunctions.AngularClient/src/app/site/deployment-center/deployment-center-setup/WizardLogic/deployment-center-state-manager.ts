import { ReplaySubject } from 'rxjs/ReplaySubject';
import { FormGroup } from '@angular/forms';
import { summaryItem } from 'app/site/deployment-center/Models/SummaryItem';
import { sourceControlProvider } from 'app/site/deployment-center/deployment-center-setup/WizardLogic/deployment-center-setup-models';

export class DeploymentCenterStateManager {
    public resourceIdStream = new ReplaySubject<string>(1);
    public wizardForm: FormGroup = new FormGroup({});

    public get sourceSettings(): FormGroup {
        return (this.wizardForm && (this.wizardForm.controls.sourceSettings as FormGroup)) || null;
    }

    public get summaryItems(): summaryItem[] {
        let summaryItems: summaryItem[] = [];
        let sourceProvider: sourceControlProvider =
            this.wizardForm.controls && this.wizardForm.controls.sourceProvider && this.wizardForm.controls.sourceProvider.value;

        summaryItems.push({
            name: 'Source Provider',
            value: sourceProvider
        });

        summaryItems.push({
            name: 'Build Provider',
            value: 'Kudu'
        });
        if (sourceProvider === 'external') {
            const isMercurial = this.wizardForm.controls.sourceSettings.value.isMercurial;
            summaryItems.push({
                name: 'Repository TYpe',
                value: isMercurial ? 'Mercurial' : 'Git'
            });
        }
        if (sourceProvider === 'github' || sourceProvider === 'bitbucket' || sourceProvider === 'vsts' || sourceProvider === 'external') {
            summaryItems.push({
                name: 'Repository',
                value: this.wizardForm.controls.sourceSettings.value.repoUrl
            });
            summaryItems.push({
                name: 'Branch',
                value: this.wizardForm.controls.sourceSettings.value.branch
            });
        } else if (sourceProvider === 'onedrive' || sourceProvider === 'dropbox') {
            const FolderUrl: string = this.wizardForm.controls.sourceSettings.value.repoUrl;
            const folderUrlPieces = FolderUrl.split('/');
            const folderName = folderUrlPieces[folderUrlPieces.length - 1];
            summaryItems.push({
                name: 'Folder',
                value: folderName
            });
        } else if (sourceProvider === 'localgit') {
        }
        return summaryItems;
    }
}
