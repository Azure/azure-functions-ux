import { TblComponent } from '../../../../controls/tbl/tbl.component';
import { ActivityDetailsLog, KuduLogMessage, UrlInfo } from '../../../Models/VSOBuildModels';
import { VSTSLogMessageType } from '../../../Models/DeploymentEnums';
import { SimpleChanges } from '@angular/core/src/metadata/lifecycle_hooks';
import { Deployment } from '../../../Models/deploymentData';
import { ArmArrayResult } from '../../../../shared/models/arm/arm-obj';
import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import * as moment from 'moment';
@Component({
  selector: 'app-vsts-deployment-table',
  templateUrl: './vsts-deployment-table.component.html',
  styleUrls: ['./vsts-deployment-table.component.scss']
})
export class VstsDeploymentTableComponent implements OnChanges {

  @Input() deploymentsData: ArmArrayResult<Deployment>;
  @ViewChild('table') appTable: TblComponent;
  private _tableItems: ActivityDetailsLog[];
  public activeDeployment: ActivityDetailsLog;
  constructor() { }

  public ngOnChanges(changes: SimpleChanges): void {

    if (!this.deploymentsData) { return };
    this._tableItems = [];
    this.deploymentsData.value.forEach(element => {
      const tableItem: ActivityDetailsLog = this._populateActivityDetails(element.properties);
      tableItem.type = 'row';
      this._tableItems.push(tableItem);
    });
    setTimeout(() => {
      this.appTable.groupItems('date', 'desc');
    }, 0);

  }

  private _assignLogType(logType: string): VSTSLogMessageType {
    logType = logType.toLowerCase();
    switch (logType) {
      case 'deployment':
        return VSTSLogMessageType.Deployment;
      case 'slotswap':
        return VSTSLogMessageType.SlotSwap;
      case 'cddeploymentconfiguration':
        return VSTSLogMessageType.CDDeploymentConfiguration;
      case 'localgitcdconfiguration':
        return VSTSLogMessageType.LocalGitCdConfiguration;
      case 'cdslotcreation':
        return VSTSLogMessageType.CDSlotCreation;
      case 'cdaccountcreated':
        return VSTSLogMessageType.CDAccountCreated;
      case 'cdtestwebappcreation':
        return VSTSLogMessageType.CDTestWebAppCreation;
      case 'cddisconnect':
        return VSTSLogMessageType.CDDisconnect;
      case 'sync':
        return VSTSLogMessageType.Sync;
      case 'start azure app service':
        return VSTSLogMessageType.StartAzureAppService;
      case 'stop azure app service':
        return VSTSLogMessageType.StopAzureAppService;
      case 'restart azure app service':
        return VSTSLogMessageType.RestartAzureAppService;
      default:
        return VSTSLogMessageType.Other;
    }
  }

  private _populateActivityDetails(item: Deployment) {
    var date: Date = new Date(item.end_time);
    var message: string = item.message;

    // populate activity details according to the message format 
    var messageToAdd: ActivityDetailsLog;
    if (!this._isMessageFormatJSON(message)) {
      messageToAdd = this._createDeploymentLogFromStringMessage(item, date);
    } else {
      let destinationSlotName = '';
      const messageJSON: KuduLogMessage = JSON.parse(item.message);
      const logType: VSTSLogMessageType = this._assignLogType(messageJSON.type);

      if (logType === VSTSLogMessageType.CDDisconnect) {
        destinationSlotName = messageJSON.prodAppName;
      } else {
        destinationSlotName = messageJSON.slotName;
      }
      if (logType !== VSTSLogMessageType.Other) {
        messageToAdd = this._createDeploymentLogFromJSONMessage(item, messageJSON, date, logType, destinationSlotName);
      }
    }
    return messageToAdd;
  }

  private _createDeploymentLogFromJSONMessage(item: any, messageJSON: KuduLogMessage, date: Date, logType: VSTSLogMessageType, targetApp?: string): ActivityDetailsLog {
    const t = moment(date);
    return {
      type: 'row',
      id: item.id,
      icon: item.status === 4 ? 'images/success.svg' : 'images/error.svg',

      //grouping is done by date therefore time information is excluded
      date: t.format('M/D/YY'),

      time: t.format('h:mm:ss A'),
      message: this._getMessage(messageJSON, item.status, logType, targetApp),
      urlInfo: this._getUrlInfoFromJSONMessage(messageJSON)
    };
  }

  private _getMessage(messageJSON: KuduLogMessage, status: number, logType: VSTSLogMessageType, targetApp?: string): string {
    targetApp = targetApp ? targetApp : messageJSON.slotName;
    switch (logType) {
      case VSTSLogMessageType.Deployment:
        return (status === 4 ? '{0} to {1}'.format('Deployed Successfully to', targetApp) : '{0} to {1}'.format('Failed to deploy to', targetApp));
      case VSTSLogMessageType.SlotSwap:
        return (status === 4 ? '{0} {1} with {2}'.format('Swapped slot', messageJSON.sourceSlot, messageJSON.targetSlot) : '{0} {1} with {2}'.format('Failed to swap slot', messageJSON.sourceSlot, messageJSON.targetSlot));
      case VSTSLogMessageType.CDDeploymentConfiguration:
        return (status === 4 ? 'Successfully setup Continuous Delivery and triggered build' : 'Failed to setup Continuous Delivery');
      case VSTSLogMessageType.LocalGitCdConfiguration:
        return 'Successfully setup Continuous Delivery for the repository';
      case VSTSLogMessageType.CDAccountCreated:
        return (status === 4 ? 'Created new Visual Studio Team Services account' : 'Failed to create Visual Studio Team Services account');
      case VSTSLogMessageType.CDSlotCreation:
        return (status === 4 ? 'Created new slot' : 'Failed to create a slot');
      case VSTSLogMessageType.CDTestWebAppCreation:
        return (status === 4 ? 'Created new Web Application for test environment' : 'Failed to create new Web Application for test environment');
      case VSTSLogMessageType.CDDisconnect:
        return 'Successfully disconnected Continuous Delivery for {0}'.format(targetApp);
      case VSTSLogMessageType.StartAzureAppService:
        return (status === 4 ? '{0} got started'.format(targetApp) : 'Failed to start {0}'.format(targetApp));
      case VSTSLogMessageType.StopAzureAppService:
        return (status === 4 ? '{0} got stopped'.format(targetApp) : 'Failed to stop {0}'.format(targetApp));
      case VSTSLogMessageType.RestartAzureAppService:
        return (status === 4 ? '{0} got restarted'.format(targetApp) : 'Failed to restart {0}'.format(targetApp));
      case VSTSLogMessageType.Sync:
        return 'Successfully triggered Continuous Delivery with latest source code from repository';
      default:
        return '';
    }
  }

  private _getCommitUrl(messageJSON: KuduLogMessage): string {
    if (messageJSON.commitId != null) {
      var repoName: string = messageJSON.repoProvider.toLowerCase();
      switch (repoName) {
        case 'tfsgit':
          return '{0}{1}/_git/{2}/commit/{3}'.format(messageJSON.collectionUrl, messageJSON.teamProject, messageJSON.repoName, messageJSON.commitId);
        case 'tfsversioncontrol':
          return '{0}{1}/_versionControl/changeset/{2}'.format(messageJSON.collectionUrl, messageJSON.teamProject, messageJSON.commitId);
        default:
          return '';
      }
    }
    return '';
  }

  private _getBuildUrl(messageJSON: KuduLogMessage): string {
    if (messageJSON.buildId != null) {
      return '{0}{1}/_build?buildId={2}&_a=summary'.format(messageJSON.collectionUrl, messageJSON.teamProject, messageJSON.buildId);
    }
    return '';
  }

  public onUrlClick(url) {
    const win = window.open(url, '_blank');
    win.focus();
  }

  private _getReleaseUrl(messageJSON: KuduLogMessage): string {
    if (messageJSON.releaseId != null) {
      return '{0}{1}/_apps/hub/ms.vss-releaseManagement-web.hub-explorer?releaseId={2}&_a=release-summary'.format(messageJSON.collectionUrl, messageJSON.teamProject, messageJSON.releaseId);
    }
    return '';
  }

  private _getUrlInfoFromJSONMessage(messageJSON: KuduLogMessage): UrlInfo[] {
    var urlInfo: UrlInfo[] = [];
    if (messageJSON.commitId) {
      let commitUrl: string = this._getCommitUrl(messageJSON);
      if (commitUrl) {
        urlInfo.push({
          urlIcon: 'images/deployment-center/CD-Commit.svg',
          urlText: `Source Version ${messageJSON.commitId.substr(0, 10)}`,
          url: commitUrl
        });
      }
    }
    if (messageJSON.buildNumber) {
      let buildUrl: string = this._getBuildUrl(messageJSON);
      if (buildUrl) {
        urlInfo.push({
          urlIcon: 'images/deployment-center/CD-Build.svg',
          urlText: `Build ${messageJSON.buildNumber}`,
          url: buildUrl
        });
      }
    }
    if (messageJSON.releaseId) {
      let releaseUrl: string = this._getReleaseUrl(messageJSON);
      if (releaseUrl) {
        urlInfo.push({
          urlIcon: 'images/deployment-center/CD-Release.svg',
          urlText: `Release: ${messageJSON.releaseId}`,
          url: releaseUrl
        });
      }
    }
    if (messageJSON.VSTSRM_BuildDefinitionWebAccessUrl) {
      urlInfo.push({
        urlText: 'Build Definition',
        url: messageJSON.VSTSRM_BuildDefinitionWebAccessUrl
      });
    }
    if (messageJSON.VSTSRM_ConfiguredCDEndPoint) {
      urlInfo.push({
        urlText: 'Release Definition',
        url: messageJSON.VSTSRM_ConfiguredCDEndPoint
      });
    }
    if (messageJSON.VSTSRM_BuildWebAccessUrl) {
      urlInfo.push({
        urlText: 'Build triggered',
        url: messageJSON.VSTSRM_BuildWebAccessUrl
      });
    }
    if (messageJSON.AppUrl) {
      urlInfo.push({
        urlText: 'Web App',
        url: messageJSON.AppUrl
      });
    }
    if (messageJSON.SlotUrl) {
      urlInfo.push({
        urlText: 'Slot',
        url: messageJSON.SlotUrl
      });
    }
    if (messageJSON.VSTSRM_AccountUrl) {
      urlInfo.push({
        urlText: 'VSTS Account',
        url: messageJSON.VSTSRM_AccountUrl
      });
    }
    if (messageJSON.VSTSRM_RepoUrl) {
      urlInfo.push({
        urlText: 'View Instructions',
        url: messageJSON.VSTSRM_RepoUrl
      });
    }
    return urlInfo;
  }
  private _createDeploymentLogFromStringMessage(item: any, date: Date): ActivityDetailsLog {

    const messageString: string = item.message;
    /* messageString is of the format
        "Updating Deployment History For Deployment [collectionUrl][teamProject]/_build?buildId=[buildId]&_a=summary"
            OR
        "Updating Deployment History For Deployment [collectionUrl][teamProject]/_apps/hub/ms.vss-releaseManagement-web.hub-explorer?releaseId=[releaseId]&_a=release-summary"
    */
    const t = moment(date);
    return {
      id: item.id,
      icon: item.status === 4 ? 'images/success.svg' : 'images/error.svg',
      type: 'row',
      // grouping is done by date therefore time information is excluded
      date: t.format('M/D/YY'),

      time: t.format('h:mm:ss A'),
      message: item.status === 4 ? 'Deployed successfully' : 'Failed to deploy',

      urlInfo: this._getUrlInfoFromStringMessage(messageString)
    };
  }

  private _getUrlInfoFromStringMessage(messageString: string): UrlInfo[] {
    const urlInfo: UrlInfo[] = [];
    if (messageString.search('buildId') !== -1) {
      urlInfo.push({
        urlIcon: 'build.svg',
        urlText: `Build: ${messageString.substring(messageString.search('=') + 1, messageString.search('&'))}`,
        url: messageString.substr(messageString.search('https'))
      });
    }
    if (messageString.search('releaseId') !== -1) {
      urlInfo.push({
        urlIcon: 'release.svg',
        urlText: `Release: ${messageString.substring(messageString.search('=') + 1, messageString.search('&'))}`,
        url: messageString.substr(messageString.search('https'))
      });
    }
    return urlInfo;
  }

  private _isMessageFormatJSON(message: any): boolean {
    try {
      JSON.parse(message);
    }
    catch (exception) {
      return false;
    }
    return true;
  }

  get TableItems() {
    return this._tableItems || [];
  }
}
