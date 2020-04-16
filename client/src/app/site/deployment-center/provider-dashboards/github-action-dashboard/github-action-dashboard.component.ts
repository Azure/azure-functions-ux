import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs/Rx';
import { SimpleChanges, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { DeploymentData, Deployment } from '../../Models/deployment-data';
import { Component, Input, OnChanges } from '@angular/core';
import { LogCategories, SiteTabIds, DeploymentCenterConstants } from '../../../../shared/models/constants';
import { BusyStateScopeManager } from '../../../../busy-state/busy-state-scope-manager';
import { BroadcastService } from '../../../../shared/services/broadcast.service';
import { DeploymentDashboard } from '../deploymentDashboard';
import { SiteService } from '../../../../shared/services/site.service';
import { LogService } from '../../../../shared/services/log.service';
import { BroadcastEvent } from '../../../../shared/models/broadcast-event';
import { PortalResources } from '../../../../shared/models/portal-resources';
import { PortalService } from '../../../../shared/services/portal.service';
import * as moment from 'moment-mini-ts';
import { dateTimeComparatorReverse } from '../../../../shared/Utilities/comparators';
import { TableItem, GetTableHash } from 'app/controls/tbl/tbl.component';
import { ArmObj } from 'app/shared/models/arm/arm-obj';
import { GithubService } from '../../deployment-center-setup/wizard-logic/github.service';
import { ArmSiteDescriptor } from '../../../../shared/resourceDescriptors';
import { UserService } from '../../../../shared/services/user.service';
import { GitHubCommit, FileContent } from '../../Models/github';

enum DeployStatus {
  Pending,
  Building,
  Deploying,
  Failed,
  Success,
}

enum DeployDisconnectStep {
  DeleteWorkflowFile = 'DeleteWorkflowFile',
  ClearSCMSettings = 'ClearSCMSettings',
}

interface DeploymentDisconnectStatus {
  step: DeployDisconnectStep;
  isSuccessful: boolean;
  errorMessage?: string;
  error?: any;
}

class GithubActionTableItem implements TableItem {
  public type: 'row' | 'group';
  public time: Date;
  public date: string;
  public status: string;
  public checkinMessage: string;
  public commit: string;
  public author: string;
  public deploymentObj: ArmObj<Deployment>;
  public active?: boolean;
}

@Component({
  selector: 'app-github-action-dashboard',
  templateUrl: './github-action-dashboard.component.html',
  styleUrls: ['./github-action-dashboard.component.scss'],
  providers: [GithubService],
})
export class GithubActionDashboardComponent extends DeploymentDashboard implements OnChanges, OnDestroy {
  @Input()
  resourceId: string;

  public deploymentObject: DeploymentData;
  public repositoryText: string;
  public branchText: string;
  public githubActionLink: string;
  public sidePanelOpened = false;
  public hideCreds = false;
  public showDisconnectModal = false;
  public githubActionDisconnectDeleteWorkflowText = '';
  public errorMessage = '';
  public rightPaneItem: ArmObj<Deployment>;

  private _viewInfoStream$ = new Subject<string>();
  private _repositoryStatusStream$ = new Subject<boolean>();
  private _ngUnsubscribe$ = new Subject();
  private _busyManager: BusyStateScopeManager;
  private _forceLoad = false;
  private _oldTableHash = 0;
  private _tableItems: GithubActionTableItem[];
  private _deleteWorkflowDuringDisconnect = false;
  private _actionWorkflowFileName = '';
  private _token = '';
  private _repoName = '';

  constructor(
    private _portalService: PortalService,
    private _logService: LogService,
    private _siteService: SiteService,
    private _broadcastService: BroadcastService,
    private _githubService: GithubService,
    userService: UserService,
    translateService: TranslateService
  ) {
    super(translateService);

    userService.getStartupInfo().subscribe(info => {
      this._token = `Bearer ${info.token}`;
    });

    this._busyManager = new BusyStateScopeManager(_broadcastService, SiteTabIds.continuousDeployment);
    this._setupRepositoryStatusStream();
    this._setupViewInfoStream();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['resourceId']) {
      this._busyManager.setBusy();
      this._viewInfoStream$.next(this.resourceId);
    }
  }

  public ngOnDestroy(): void {
    this._ngUnsubscribe$.next();
  }

  public showDeploymentCredentials() {
    this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter, 'credentials-dashboard');
  }

  public browseToSite() {
    this._browseToSite(this.deploymentObject);
  }

  public refresh() {
    this._forceLoad = true;
    this._resetValues();
    this._viewInfoStream$.next(this.resourceId);
  }

  public disconnect() {
    this._disconnectDeployment();
  }

  public githubActionOnClick() {
    if (this.githubActionLink) {
      const win = window.open(this.githubActionLink, '_blank');
      win.focus();
    }
  }

  public repositoryOnClick() {
    const repoUrl = this.deploymentObject && this.deploymentObject.sourceControls.properties.repoUrl;
    if (repoUrl) {
      const win = window.open(repoUrl, '_blank');
      win.focus();
    }
  }

  public branchOnClick() {
    const repoUrl = this.deploymentObject && this.deploymentObject.sourceControls.properties.repoUrl;
    const branchUrl = `${repoUrl}/tree/${this.branchText}`;
    if (branchUrl) {
      const win = window.open(branchUrl, '_blank');
      win.focus();
    }
  }

  public showDisconnectPrompt() {
    this.showDisconnectModal = true;
  }

  public cancelDisconnectPrompt() {
    this._deleteWorkflowDuringDisconnect = false;
    this._hideDisconnectPrompt();
  }

  public toggleDeleteWorkflowState() {
    this._deleteWorkflowDuringDisconnect = !this._deleteWorkflowDuringDisconnect;
  }

  get tableItems() {
    if (this._deploymentFetchTries > 10) {
      this.tableMessages.emptyMessage = this._translateService.instant(PortalResources.noDeploymentDataAvailable);
    }

    return this._tableItems || [];
  }

  public _hideDisconnectPrompt() {
    this.showDisconnectModal = false;
  }

  public details(item: GithubActionTableItem) {
    this.hideCreds = false;
    this.rightPaneItem = item.deploymentObj;
    this.sidePanelOpened = true;
  }

  private _disconnectDeployment() {
    let notificationId = null;
    this._busyManager.setBusy();
    this._portalService
      .startNotification(
        this._translateService.instant(PortalResources.disconnectingDeployment),
        this._translateService.instant(PortalResources.disconnectingDeployment)
      )
      .take(1)
      .do(notification => {
        notificationId = notification.id;
      })
      // NOTE (michinoy): First try to delete the workflow file.
      .switchMap(() => this._deleteWorkflowFileIfNeeded())
      // NOTE (michinoy): Next try to clear the SCM settings.
      .switchMap(result => this._clearSCMSettings(result))
      .switchMap(r => {
        if (!r.isSuccessful) {
          return this._deleteWorkflowDuringDisconnect
            ? Observable.throw({
                step: DeployDisconnectStep.ClearSCMSettings,
                isSuccessful: false,
                errorMessage: this._translateService.instant(PortalResources.disconnectingDeploymentFailWorkflowFileDeleteSucceeded),
                error: r.error,
              })
            : Observable.throw({
                step: DeployDisconnectStep.ClearSCMSettings,
                isSuccessful: false,
                errorMessage: this._translateService.instant(PortalResources.disconnectingDeploymentFail),
                error: r.error,
              });
        } else {
          return Observable.of(r);
        }
      })
      .subscribe(
        r => {
          this._busyManager.clearBusy();
          this._deleteWorkflowDuringDisconnect = false;
          this._portalService.stopNotification(
            notificationId,
            true,
            this._translateService.instant(PortalResources.disconnectingDeploymentSuccess)
          );
          this._broadcastService.broadcastEvent(BroadcastEvent.ReloadDeploymentCenter);
        },
        err => {
          this._deleteWorkflowDuringDisconnect = false;
          this._portalService.stopNotification(notificationId, false, err.errorMessage);
          this._logService.error(LogCategories.cicd, '/github-action-dashboard-disconnect', { resourceId: this.resourceId, error: err });
        }
      );
  }

  private _clearSCMSettings(deploymentDisconnectStatus: DeploymentDisconnectStatus) {
    if (deploymentDisconnectStatus.isSuccessful) {
      this._logService.trace(LogCategories.cicd, '/github-action-dashboard-disconnect-scm', { resourceId: this.resourceId });

      return this._siteService.deleteSiteSourceControlConfig(this.resourceId);
    } else {
      return Observable.throw(deploymentDisconnectStatus);
    }
  }

  private _deleteWorkflowFileIfNeeded(): Observable<DeploymentDisconnectStatus> {
    this._hideDisconnectPrompt();
    const errorMessage = this._translateService
      .instant(PortalResources.githubActionDisconnectWorkflowDeleteFailed)
      .format(this._actionWorkflowFileName, this.branchText, this.repositoryText);

    const successStatus: DeploymentDisconnectStatus = {
      step: DeployDisconnectStep.DeleteWorkflowFile,
      isSuccessful: true,
      errorMessage: null,
    };

    const failedStatus: DeploymentDisconnectStatus = {
      step: DeployDisconnectStep.DeleteWorkflowFile,
      isSuccessful: false,
      errorMessage: errorMessage,
    };

    if (!this._deleteWorkflowDuringDisconnect) {
      // NOTE(michinoy): In this case, the user has opted not to delete the file, it should not block any dependent actions.
      return Observable.of(successStatus);
    } else {
      this._logService.trace(LogCategories.cicd, '/github-action-dashboard-disconnect-workflow', { resourceId: this.resourceId });
      const workflowFilePath = `.github/workflows/${this._actionWorkflowFileName}`;

      return this._githubService
        .fetchWorkflowConfiguration(this._token, this.repositoryText, this._repoName, this.branchText, workflowFilePath)
        .switchMap(result => this._deleteWorkflowFile(workflowFilePath, result))
        .do(_ => successStatus)
        .catch(err => {
          // Something failed on the fetch action
          failedStatus.error = err;
          return Observable.of(failedStatus);
        });
    }
  }

  private _deleteWorkflowFile(workflowFilePath: string, fileContent: FileContent) {
    if (fileContent) {
      const deleteCommitInfo: GitHubCommit = {
        repoName: this._repoName,
        branchName: this.branchText,
        filePath: workflowFilePath,
        message: this._translateService.instant(PortalResources.githubActionWorkflowDeleteCommitMessage),
        committer: {
          name: 'Azure App Service',
          email: 'donotreply@microsoft.com',
        },
        sha: fileContent.sha,
      };

      return this._githubService.deleteActionWorkflow(this._token, deleteCommitInfo);
    } else {
      // NOTE (michinoy): fetchWorkflowConfiguration return null if the file is not found.
      return Observable.throw({
        errorMessage: `Workflow file '${workflowFilePath}' not found in branch '${this.branchText}' from repo '${this._repoName}'`,
      });
    }
  }

  private _setupViewInfoStream() {
    this._viewInfoStream$
      .takeUntil(this._ngUnsubscribe$)
      .switchMap(resourceId => {
        if (resourceId !== this.resourceId) {
          this._logService.trace(LogCategories.cicd, '/github-action-dashboard', { resourceId });
        }

        return Observable.zip(
          this._siteService.getSite(resourceId, this._forceLoad),
          this._siteService.getSiteConfig(resourceId, this._forceLoad),
          this._siteService.getPublishingCredentials(resourceId, this._forceLoad),
          this._siteService.getSiteSourceControlConfig(resourceId, this._forceLoad),
          this._siteService.getSiteDeployments(resourceId),
          this._siteService.getPublishingUser(),
          (site, siteConfig, pubCreds, sourceControl, deployments, publishingUser) => ({
            site: site.result,
            siteConfig: siteConfig.result,
            pubCreds: pubCreds.result,
            sourceControl: sourceControl.result,
            deployments: deployments.result,
            publishingUser: publishingUser.result,
          })
        );
      })
      .subscribe(
        r => {
          this._busyManager.clearBusy();
          this._forceLoad = false;
          this.deploymentObject = {
            site: r.site,
            siteConfig: r.siteConfig,
            sourceControls: r.sourceControl,
            publishingCredentials: r.pubCreds,
            deployments: r.deployments,
            publishingUser: r.publishingUser,
          };

          if (this.deploymentObject.sourceControls && this.deploymentObject.sourceControls.properties) {
            if (
              this.repositoryText !== this.deploymentObject.sourceControls.properties.repoUrl ||
              this.branchText !== this.deploymentObject.sourceControls.properties.branch
            ) {
              this.errorMessage = '';
              this.repositoryText = this.deploymentObject.sourceControls.properties.repoUrl;
              this._repoName = this.repositoryText.toLocaleLowerCase().replace(`${DeploymentCenterConstants.githubUri}/`, '');
              this.branchText = this.deploymentObject.sourceControls.properties.branch;
              this.githubActionLink = `${this.repositoryText}/actions?query=event%3Apush+branch%3A${this.branchText}`;
              this._repositoryStatusStream$.next(true);
            }

            const siteDescriptor = <ArmSiteDescriptor>ArmSiteDescriptor.getSiteDescriptor(this.deploymentObject.site.id);
            this._actionWorkflowFileName = this._githubService.getWorkflowFileName(
              this.branchText,
              siteDescriptor.site,
              siteDescriptor.slot
            );

            this.githubActionDisconnectDeleteWorkflowText = this._translateService
              .instant(PortalResources.githubActionDisconnectDeleteWorkflow)
              .format(this._actionWorkflowFileName, this.branchText, this.repositoryText);
          }

          if (this.deploymentObject.deployments) {
            this._populateTable();
          }
        },
        err => {
          this._busyManager.clearBusy();
          this._forceLoad = false;
          this.deploymentObject = null;
          this._logService.error(LogCategories.cicd, '/github-action-dashboard', { resourceId: this.resourceId, error: err });
        }
      );

    // refresh automatically every 5 seconds
    Observable.timer(5000, 5000)
      .takeUntil(this._ngUnsubscribe$)
      .subscribe(() => {
        this._deploymentFetchTries++;
        this._viewInfoStream$.next(this.resourceId);
      });
  }

  private _setupRepositoryStatusStream() {
    this._repositoryStatusStream$
      .takeUntil(this._ngUnsubscribe$)
      .switchMap(_ =>
        Observable.zip(
          this._githubService.fetchRepo(this._token, this.repositoryText, this._repoName).catch(r => Observable.of(r)),
          this._githubService.fetchBranch(this._token, this.repositoryText, this._repoName, this.branchText).catch(r => Observable.of(r))
        )
      )
      .subscribe(responses => {
        const [repoResponse, branchResponse] = responses;
        if (repoResponse && repoResponse.status === 404) {
          this.errorMessage = this._translateService
            .instant(PortalResources.githubActionDashboardRepositoryMissingError)
            .format(this.repositoryText);
        } else if (branchResponse && branchResponse.status === 404) {
          this.errorMessage = this._translateService
            .instant(PortalResources.githubActionDashboardBranchMissingError)
            .format(this.branchText, this.repositoryText);
        } else {
          this.errorMessage = '';
        }
      });
  }

  private _resetValues() {
    this.repositoryText = null;
    this.branchText = null;
  }

  private _populateTable() {
    const deployments = this.deploymentObject.deployments.value;
    const tableItems = deployments.map(value => {
      const item = value.properties;
      const date: moment.Moment = moment(item.received_time);
      const t = moment(date);

      const commitId = item.id.substr(0, 7);
      const author = item.author;
      const row: GithubActionTableItem = {
        type: 'row',
        time: date.toDate(),
        date: t.format('M/D/YY'),
        commit: commitId,
        checkinMessage: item.message,
        status: this._getStatusString(item.status, item.progress),
        active: item.active,
        author: author,
        deploymentObj: value,
      };

      return row;
    });

    const newHash = GetTableHash(tableItems);

    if (this._oldTableHash !== newHash) {
      this._tableItems = tableItems.sort(dateTimeComparatorReverse);
      this._oldTableHash = newHash;
    }
  }

  private _getStatusString(status: DeployStatus, progressString: string): string {
    switch (status) {
      case DeployStatus.Building:
      case DeployStatus.Deploying:
        return progressString;
      case DeployStatus.Pending:
        return this._translateService.instant(PortalResources.pending);
      case DeployStatus.Failed:
        return this._translateService.instant(PortalResources.failed);
      case DeployStatus.Success:
        return this._translateService.instant(PortalResources.success);
      default:
        return '';
    }
  }
}
