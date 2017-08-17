import { VSOBuildDefinition } from '../../Models/VSOBuildDefinition';
import { providerHelper } from '../providerHelper';
import { DeploymentData } from '../../Models/deploymentData';
import { Observable} from 'rxjs/Rx';
import { EssentialColumn, EssentialItem } from '../../Models/EssentialItem';

export class VstsGithubHelper extends providerHelper
{
    public getEssentialItems(data: DeploymentData): Observable<EssentialColumn[]>
    {
        const columns: EssentialColumn[] = [];

        let vstsMetaData : any = data.siteMetadata.properties;

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

    public get showTable(){
        return true;
    }

    public getTableHeaders(data: DeploymentData): string[]{
        return ['Time', 'Status', 'message', 'Actions'];
    }

    public getTableItems(data: DeploymentData): any[]{
        const items: any[] = [];
        
        data.deployments.value.forEach(value =>{
            const t: any = {
                time: value.properties.end_time,
                status: value.properties.complete ? 'Complete' : 'In Progress',
                message: JSON.parse(value.properties.message).message
            };
            items.push(t);
        });
        return items;
    }

    private getColumn1(data: DeploymentData, vsoDef: VSOBuildDefinition ){
        const col: EssentialColumn = {
            items : []
        };

        const item1: EssentialItem = {
            icon: null,
            label: 'Build Provider',
            text: 'VSTS',
            onClick: null
        };

        const item2: EssentialItem = {
            icon: null,
            label: 'Account',
            text: new URL(vsoDef.url).host,
            onClick: () => {
                const win = window.open(`https://${new URL(vsoDef.url).host}`, '_blank');
                win.focus();
            }
        };

        const item3: EssentialItem = {
            icon: null,
            label: 'Source',
            text: vsoDef.repository.type,
            onClick: null
        };

        col.items.push(item1, item2, item3);
        return col;
    }

    private getColumn2(data: DeploymentData, vsoDef : VSOBuildDefinition ){
        const col: EssentialColumn = {
            items : []
        };

        const item1: EssentialItem = {
            icon: null,
            label: 'Project',
            text: vsoDef.project.name,
            onClick: null
        };

        const item2: EssentialItem = {
            icon: null,
            label: 'Repository',
            text: vsoDef.repository.id,
            onClick: () => {
                const win = window.open(vsoDef.repository.id, '_blank');
                win.focus();
            }
        };

        const item3: EssentialItem = {
            icon: null,
            label: 'Branch',
            text: vsoDef.repository.defaultBranch.replace('refs/heads/', ''),
            onClick: null
        };

        col.items.push(item1, item2, item3);
        return col;

    }
    private getColumn3(data: DeploymentData, vsoDef: VSOBuildDefinition ){
        const col: EssentialColumn = {
            items : []
        };

        const slotName = data.siteMetadata.properties['VSTSRM_SlotName'];
        const testSiteName = data.siteMetadata.properties['VSTSRM_TestAppName'];
        const item1: EssentialItem = {
            icon: null,
            label: 'Deployment Slot',
            text:  !!slotName ? slotName : 'Production',
            onClick: !slotName ? null : () => {
                console.log(slotName);
            }
        };

        const item2: EssentialItem = {
            icon: null,
            label: 'Load Test',
            text: !!testSiteName ? 'Enabled' : 'Disabled',
            onClick: null
        };

        col.items.push(item1, item2);
        return col;
    }
}