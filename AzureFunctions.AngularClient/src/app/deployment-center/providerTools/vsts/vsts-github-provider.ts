import { VSOBuildDefinition } from '../../Models/VSOBuildDefinition';
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

        const endpoint = vstsMetaData['VSTSRM_ConfiguredCDEndPoint'];
        const endpointUri = new URL(endpoint);
        const projectId = vstsMetaData['VSTSRM_ProjectId'];
        const buildId = vstsMetaData['VSTSRM_BuildDefinitionId'];

        return this._cacheService.get(`https://${endpointUri.host}/DefaultCollection/${projectId}/_apis/build/Definitions/${buildId}?api-version=2.0`)
        .flatMap(r => {
            const vsoDef : VSOBuildDefinition  = r.json();
            columns.push(this.getColumn1(data, vsoDef));
            columns.push(this.getColumn2(data,vsoDef));
            columns.push(this.getColumn3(data, vsoDef));
            return Observable.of(columns);
        });
    }

    private getColumn1(data: DeploymentData, vsoDef : VSOBuildDefinition ){
        let col1: EssentialColumn = {
            items : []
        };

        const BuildProviderItem: EssentialItem = {
            icon: null,
            label: 'Build Provider',
            text: 'VSTS',
            onClick: null
        };

        const AccountItem: EssentialItem = {
            icon: null,
            label: 'Account',
            text: new URL(vsoDef.url).host,
            onClick: null
        };

        const SourceItem: EssentialItem = {
            icon: null,
            label: 'Source',
            text: vsoDef.repository.type,
            onClick: null
        }

        col1.items.push(BuildProviderItem, AccountItem, SourceItem);
        return col1;
    }

    private getColumn2(data: DeploymentData, vsoDef : VSOBuildDefinition ){
        let col: EssentialColumn = {
            items : []
        };

        const BuildProviderItem: EssentialItem = {
            icon: null,
            label: 'Project',
            text: vsoDef.project.name,
            onClick: null
        };

        const AccountItem: EssentialItem = {
            icon: null,
            label: 'Repository',
            text: vsoDef.repository.id,
            onClick: null
        };

        const SourceItem: EssentialItem = {
            icon: null,
            label: 'Branch',
            text: vsoDef.repository.defaultBranch.replace('refs/heads/', ''),
            onClick: null
        }

        col.items.push(BuildProviderItem, AccountItem, SourceItem);
        return col;
    }

    private getColumn3(data: DeploymentData, vsoDef : VSOBuildDefinition ){
        let col: EssentialColumn = {
            items : []
        };

        var slotName = data.siteMetadata.properties['VSTSRM_SlotName'];
        var testSiteName = data.siteMetadata.properties['VSTSRM_TestAppName'];
        const BuildProviderItem: EssentialItem = {
            icon: null,
            label: 'Deployment Slot',
            text:  !!slotName ? slotName : 'Production',
            onClick: null
        };

        const item2 : EssentialItem = {
            icon: null,
            label: 'Load Test',
            text: !!testSiteName ? 'Enabled' : 'Disabled',
            onClick: null
        };
        col.items.push(BuildProviderItem, item2);
        return col;
    }
}