import { Component, OnDestroy } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
import { DeploymentCenterStateManager } from '../../../wizard-logic/deployment-center-state-manager';
import { RuntimeStackService } from 'app/shared/services/runtimestack.service';
import { WebAppCreateStack } from 'app/shared/models/stacks';
import { LogService } from 'app/shared/services/log.service';
import { LogCategories, Os, RuntimeStacks } from 'app/shared/models/constants';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';

@Component({
  selector: 'app-stack-selector',
  templateUrl: './stack-selector.component.html',
  styleUrls: [
    './stack-selector.component.scss',
    '../configure-github.component.scss',
    '../../step-configure.component.scss',
    '../../../deployment-center-setup.component.scss',
  ],
})
export class StackSelectorComponent implements OnDestroy {
  public runtimeStackItems: DropDownElement<string>[] = [];
  public runtimeStackVersionItems: DropDownElement<string>[] = [];
  public runtimeStacksLoading = false;
  public runtimeStackVersionsLoading = false;
  public requiredValidator: RequiredValidator;
  public stackNotSupportedMessage = '';
  public stackMismatchMessage = '';
  public selectedRuntimeStack = '';
  public selectedRuntimeStackVersion = '';

  private _ngUnsubscribe$ = new Subject();
  private _runtimeStacks: WebAppCreateStack[] = [];
  private _runtimeStackStream$ = new ReplaySubject<string>();
  private _runtimeStackVersionStream$ = new ReplaySubject<string>();

  constructor(
    public wizard: DeploymentCenterStateManager,
    private _runtimeStackService: RuntimeStackService,
    private _logService: LogService,
    private _translateService: TranslateService
  ) {
    this._registerSubscribers();
    this._setupValidators();
  }

  ngOnDestroy(): void {
    this.wizard.buildSettings.get('runtimeStack').setValidators([]);
    this.wizard.buildSettings.get('runtimeStack').updateValueAndValidity();
    this.wizard.buildSettings.get('runtimeStackVersion').setValidators([]);
    this.wizard.buildSettings.get('runtimeStackVersion').updateValueAndValidity();
    this._ngUnsubscribe$.next();
  }

  runtimeStackChanged(stackSelected: DropDownElement<string>) {
    this._runtimeStackStream$.next(stackSelected.value);
  }

  runtimeStackVersionChanged(stackVersionSelected: DropDownElement<string>) {
    this._runtimeStackVersionStream$.next(stackVersionSelected.value);
  }

  private _setupValidators() {
    this.requiredValidator = new RequiredValidator(this._translateService, false);
    this.wizard.buildSettings.get('runtimeStack').setValidators([this.requiredValidator.validate.bind(this.requiredValidator)]);
    this.wizard.buildSettings.get('runtimeStack').updateValueAndValidity();
    this.wizard.buildSettings.get('runtimeStackVersion').setValidators([this.requiredValidator.validate.bind(this.requiredValidator)]);
    this.wizard.buildSettings.get('runtimeStackVersion').updateValueAndValidity();
  }

  private _registerSubscribers() {
    this._runtimeStackStream$.takeUntil(this._ngUnsubscribe$).subscribe(stackValue => {
      this.selectedRuntimeStack = stackValue;
      this.selectedRuntimeStackVersion = '';

      this.runtimeStackVersionsLoading = true;
      this.runtimeStackVersionItems = [];

      // NOTE(michinoy): Show a warning message if the user selects a stack which does not match what their app is configured with.
      if (this.wizard.stack && stackValue !== this.wizard.stack.toLocaleLowerCase() && !this.stackNotSupportedMessage) {
        if (this.wizard.stack.toLocaleLowerCase() === RuntimeStacks.aspnet) {
          this.stackMismatchMessage = this._translateService.instant(PortalResources.githubActionAspNetStackMismatchMessage, {
            appName: this.wizard.slotName ? `${this.wizard.siteName} (${this.wizard.slotName})` : this.wizard.siteName,
          });
        } else {
          this.stackMismatchMessage = this._translateService.instant(PortalResources.githubActionStackMismatchMessage, {
            appName: this.wizard.slotName ? `${this.wizard.siteName} (${this.wizard.slotName})` : this.wizard.siteName,
            stack: this.wizard.stack,
          });
        }
      } else {
        this.stackMismatchMessage = '';
      }

      this._populateRuntimeStackVersionItems(stackValue);
    });

    this._runtimeStackVersionStream$.takeUntil(this._ngUnsubscribe$).subscribe(versionValue => {
      this.selectedRuntimeStackVersion = versionValue;
      this.wizard.buildSettings
        .get('runtimeStackRecommendedVersion')
        .setValue(this._getRuntimeStackRecommendedVersion(this.selectedRuntimeStack, versionValue));
    });

    this.wizard.siteArmObj$.subscribe(_ => {
      this.runtimeStackItems = [];
      this.runtimeStacksLoading = true;
      this._fetchStacks();
    });
  }

  private _fetchStacks() {
    const os = this.wizard.isLinuxApp ? Os.linux : Os.windows;
    this.runtimeStacksLoading = true;

    this._runtimeStackService.getWebAppGitHubActionStacks(os).subscribe(runtimeStackItemsResult => {
      if (runtimeStackItemsResult.isSuccessful) {
        this._runtimeStacks = runtimeStackItemsResult.result;
        this._populateRuntimeStackItems();
      } else {
        this._logService.error(LogCategories.cicd, '/fetch-stacks', runtimeStackItemsResult.error);
      }
    });
  }

  private _populateRuntimeStackItems() {
    this.runtimeStackItems = this._runtimeStacks.map(stack => ({
      displayLabel: stack.displayText,
      value: stack.value.toLocaleLowerCase(),
    }));

    // NOTE(michinoy): Once the dropdown is populated, preselect stack that the user had selected during create.
    // If the users app was built using a stack that is not supported, show a warning message.
    if (this.wizard.stack) {
      const appSelectedStack = this.runtimeStackItems.filter(item => item.value === this.wizard.stack.toLocaleLowerCase());
      if (appSelectedStack && appSelectedStack.length === 1) {
        this.stackNotSupportedMessage = '';
        this._runtimeStackStream$.next(appSelectedStack[0].value);
      } else if (this.wizard.stack.toLocaleLowerCase() === RuntimeStacks.aspnet) {
        this.stackNotSupportedMessage = this._translateService.instant(PortalResources.githubActionAspNetStackNotSupportedMessage, {
          appName: this.wizard.slotName ? `${this.wizard.siteName} (${this.wizard.slotName})` : this.wizard.siteName,
        });
      } else {
        this.stackNotSupportedMessage = this._translateService.instant(PortalResources.githubActionStackNotSupportedMessage, {
          appName: this.wizard.slotName ? `${this.wizard.siteName} (${this.wizard.slotName})` : this.wizard.siteName,
          stack: this.wizard.stack,
        });
      }
    }

    this.runtimeStacksLoading = false;
  }

  private _populateRuntimeStackVersionItems(stackValue: string) {
    if (stackValue) {
      const runtimeStack = this._runtimeStacks.find(stack => stack.value.toLocaleLowerCase() === stackValue);

      this.runtimeStackVersionItems = runtimeStack.versions.map(version => ({
        displayLabel: version.displayText,
        value: version.supportedPlatforms[0].runtimeVersion,
      }));

      // NOTE(michinoy): once the stack versions dropdown is populated, default selection can be done in either of following ways:
      // 1. If the stack version is selected for the app and it exists in the list
      // 2. Select the first item in the list if the stack version does not exist (e.g. .NET Core) Or does not exist in the list (e.g. Node LTS)

      const appSelectedStackVersion = this.runtimeStackVersionItems.filter(
        item => item.value.toLocaleLowerCase() === this.wizard.stackVersion.toLocaleLowerCase()
      );

      if (appSelectedStackVersion && appSelectedStackVersion.length === 1) {
        this._runtimeStackVersionStream$.next(appSelectedStackVersion[0].value);
      } else {
        this._runtimeStackVersionStream$.next(this.runtimeStackVersionItems[0].value);
      }
    }

    this.runtimeStackVersionsLoading = false;
  }

  private _getRuntimeStackRecommendedVersion(stackValue: string, runtimeVersionValue: string): string {
    const runtimeStack = this._runtimeStacks.find(stack => stack.value.toLocaleLowerCase() === stackValue);
    const runtimeStackVersion = runtimeStack.versions.find(version => version.supportedPlatforms[0].runtimeVersion === runtimeVersionValue);

    return runtimeStackVersion.supportedPlatforms[0].githubActionSettings.recommendedVersion;
  }
}
