import { providerHelper } from '../providerHelper';
import { DeploymentData } from '../../Models/deploymentData';
import { Observable} from 'rxjs/Rx';
import { EssentialColumn, EssentialItem } from '../../Models/EssentialItem';

export class VstsGithubHelper extends providerHelper
{
    public getEssentialItems(data: DeploymentData): Observable<EssentialColumn[]>
    {
        let columns: EssentialColumn[] = [];

        var vstsMetaData : any = data.siteMetadata.properties;
        let col1: EssentialColumn = {
            items : []
        };

        const BuildProviderItem : EssentialItem = {
            icon: null,
            label: 'Build Provider',
            text: 'VSTS',
            onClick: null
        };
        const endpoint = vstsMetaData['VSTSRM_ConfiguredCDEndPoint'];
        const endpointUri = new URL(endpoint);

        const AccountItem : EssentialItem = {
            icon: null,
            label: 'Account',
            text: endpointUri.host,
            onClick: null
        };

        const SourceItem : EssentialItem = {
            icon: null,
            label: 'Source',
            text: 'GitHub',
            onClick: null
        }

        col1.items.push(BuildProviderItem, AccountItem, SourceItem);
        columns.push(col1);


        let col2: EssentialColumn = {
            items : []
        };

        const ProjectItem : EssentialItem = {
            icon: null,
            label: 'Project',
            text: "mrproject",
            onClick: null
        };

        const RepoItem : EssentialItem = {
            icon: null,
            label: 'Repository',
            text: "myrepo",
            onClick: null
        };

        const BranchItem : EssentialItem = {
            icon: null,
            label: 'Branch',
            text: 'dev',
            onClick: null
        }

        col2.items.push(ProjectItem, RepoItem, BranchItem);
        columns.push(col2);

        return Observable.of(columns);
    }

}