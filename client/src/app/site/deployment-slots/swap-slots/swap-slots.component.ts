import { Component, Injector, Input, OnDestroy, Output } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FeatureComponent } from 'app/shared/components/feature-component';
import { ArmObj, ResourceId, ArmArrayResult } from 'app/shared/models/arm/arm-obj';
import { Site } from 'app/shared/models/arm/site';
import { SlotsDiff } from 'app/shared/models/arm/slots-diff';
import { LogCategories, SiteTabIds } from 'app/shared/models/constants';
import { DropDownElement } from 'app/shared/models/drop-down-element';
import { PortalResources } from 'app/shared/models/portal-resources';
import { ArmSiteDescriptor } from 'app/shared/resourceDescriptors';
import { AuthzService } from 'app/shared/services/authz.service';
import { CacheService } from 'app/shared/services/cache.service';
import { LogService } from 'app/shared/services/log.service';
import { SiteService } from 'app/shared/services/site.service';
import { PortalService } from 'app/shared/services/portal.service';

// TODO [andimarc]: disable all controls when a swap operation is in progress
// TODO [andimarc]: disable controls when in phaseTwo or complete

interface SlotInfo {
    siteArm: ArmObj<Site>,
    hasSiteAuth?: boolean,
    hasSwapAccess?: boolean
}

@Component({
    selector: 'swap-slots',
    templateUrl: './swap-slots.component.html',
    styleUrls: ['./swap-slots.component.scss', './../common.scss']
})
export class SwapSlotsComponent extends FeatureComponent<ResourceId> implements OnDestroy {
    @Input() set resourceIdInput(resourceId: ResourceId) {
        this._resourceId = resourceId;
        this.setInput(resourceId);
    }

    @Output() close: Subject<boolean>;

    public dirtyMessage: string;

    public Resources = PortalResources;
    public srcDropDownOptions: DropDownElement<string>[];
    public destDropDownOptions: DropDownElement<string>[];
    public siteResourceId: ResourceId;

    public slotsNotUnique: boolean;
    public srcNotSelected: boolean;
    public srcNoSwapAccess: boolean;
    public destNotSelected: boolean;
    public destNoSwapAccess: boolean;
    public siteAuthConflicts: string[];
    public isValid: boolean;

    public previewLink: string;
    public phase: null | 'phaseOne' | 'phaseTwo' | 'complete';

    public successMessage = null;

    public checkingSrc: boolean;
    public checkingDest: boolean;
    public loadingDiffs: boolean;
    public swapping: boolean;

    public slotsDiffs: SlotsDiff[];
    public diffsPreviewSlot: 'source' | 'target' = 'source';

    public swapForm: FormGroup;

    private _swappedOrCancelled: boolean;

    private _diffSubject: Subject<string>;

    private _slotsMap: { [key: string]: SlotInfo };

    private _resourceId: ResourceId;

    constructor(
        private _authZService: AuthzService,
        private _cacheService: CacheService,
        private _fb: FormBuilder,
        private _logService: LogService,
        private _portalService: PortalService,
        private _siteService: SiteService,
        private _translateService: TranslateService,
        injector: Injector
    ) {
        super('SwapSlotsComponent', injector, SiteTabIds.deploymentSlotsConfig);

        this.close = new Subject<boolean>();

        // TODO [andimarc]
        // For ibiza scenarios, this needs to match the deep link feature name used to load this in ibiza menu
        this.featureName = 'deploymentslots';
        this.isParentComponent = true;

        this._setupSubscriptions();
    }

    protected setup(inputEvents: Observable<ResourceId>) {
        //TODO [andimarc]: detect if we are already in phase two of a swap

        return inputEvents
            .distinctUntilChanged()
            .switchMap(resourceId => {
                this._resourceId = resourceId;

                this.previewLink = null;

                this.successMessage = null;

                this.swapping = false;

                this.srcDropDownOptions = [];
                this.destDropDownOptions = [];
                this._slotsMap = {};

                this._swappedOrCancelled = false;

                const siteDescriptor = new ArmSiteDescriptor(resourceId);
                this.siteResourceId = siteDescriptor.getSiteOnlyResourceId();

                return Observable.zip(
                    this._siteService.getSite(this.siteResourceId),
                    this._siteService.getSlots(this.siteResourceId),
                    this._siteService.getSlotConfigNames(this.siteResourceId),
                    this._siteService.getSiteConfig(this._resourceId)
                );
            })
            .do(r => {
                const siteResult = r[0];
                const slotsResult = r[1];
                const slotConfigNamesResult = r[2];
                const siteConfigResult = r[3];

                let success = true;

                if (!siteResult.isSuccessful) {
                    this._logService.error(LogCategories.swapSlots, '/swap-slots', siteResult.error.result);
                    success = false;
                }
                if (!slotsResult.isSuccessful) {
                    this._logService.error(LogCategories.swapSlots, '/swap-slots', slotsResult.error.result);
                    success = false;
                }
                if (!slotConfigNamesResult.isSuccessful) {
                    this._logService.error(LogCategories.swapSlots, '/swap-slots', slotConfigNamesResult.error.result);
                    success = false;
                }
                if (!siteConfigResult.isSuccessful) {
                    this._logService.error(LogCategories.swapSlots, '/swap-slots', siteConfigResult.error.result);
                    success = false;
                }

                if (success) {
                    const options: DropDownElement<string>[] = [];

                    [siteResult.result, ...slotsResult.result.value].forEach(s => {
                        this._slotsMap[s.id] = { siteArm: s };
                        options.push({
                            displayLabel: s.properties.name,
                            value: s.id
                        });
                    })

                    this._slotsMap[this._resourceId].hasSiteAuth = siteConfigResult.result.properties.siteAuthEnabled;

                    const slotConfigNames = slotConfigNamesResult.result.properties;
                    const hasStickySettings = slotConfigNames.appSettingNames.length > 0 || slotConfigNames.connectionStringNames.length > 0;

                    this.swapForm.controls['src'].setValue(this._resourceId);
                    this.swapForm.controls['dest'].setValue(null);

                    const multiPhaseCtrl = this.swapForm.controls['multiPhase'];
                    multiPhaseCtrl.setValue(false);
                    if (hasStickySettings) {
                        multiPhaseCtrl.enable();
                    } else {
                        multiPhaseCtrl.disable();
                    }

                    this.srcDropDownOptions = JSON.parse(JSON.stringify(options));
                    this.srcDropDownOptions.forEach(o => o.default = o.value === this._resourceId);

                    this.destDropDownOptions = JSON.parse(JSON.stringify(options));
                }
            });
    }

    private _setupSubscriptions() {
        this._diffSubject = new Subject<string>();
        this._diffSubject
            .takeUntil(this.ngUnsubscribe)
            .distinctUntilChanged()
            .switchMap(s => {
                this.loadingDiffs = true;
                const list = s.split(',');
                return this._getSlotsDiffs(list[0], list[1]);
            })
            .subscribe(r => {
                this.loadingDiffs = false;
                this.slotsDiffs = !r ? null : r.value.map(o => o.properties);
            });

        const srcCtrl = this._fb.control({ value: null, disabled: false });
        const destCtrl = this._fb.control({ value: null, disabled: false });
        const multiPhaseCtrl = this._fb.control({ value: false, disabled: false });

        this.swapForm = this._fb.group({
            src: srcCtrl,
            dest: destCtrl,
            multiPhase: multiPhaseCtrl
        });

        srcCtrl.valueChanges
            .takeUntil(this.ngUnsubscribe)
            .distinctUntilChanged()
            .switchMap(v => {
                this.checkingSrc = true;
                return this._getSlotInfo(srcCtrl.value);
            })
            .subscribe(slotInfo => {
                if (slotInfo) {
                    this._slotsMap[slotInfo.siteArm.id] = slotInfo;
                    this._validateAndDiff();
                }
                this.checkingSrc = false;
            });

        destCtrl.valueChanges
            .takeUntil(this.ngUnsubscribe)
            .distinctUntilChanged()
            .switchMap(v => {
                this.checkingDest = true;
                return this._getSlotInfo(destCtrl.value);
            })
            .subscribe(slotInfo => {
                if (slotInfo) {
                    this._slotsMap[slotInfo.siteArm.id] = slotInfo;
                    this._validateAndDiff();
                }
                this.checkingDest = false;
            });
    }

    private _validateAndDiff() {
        // TODO [andimarc]: user form validation instaed

        const src = this.swapForm ? this.swapForm.controls['src'].value : null;
        const dest = this.swapForm ? this.swapForm.controls['dest'].value : null;
        const multiPhase = this.swapForm ? this.swapForm.controls['multiPhase'].value : false;

        this.slotsNotUnique = src === dest;
        this.srcNotSelected = !src;
        this.destNotSelected = !dest;
        this.srcNoSwapAccess = !!src && this._slotsMap[src] && !this._slotsMap[src].hasSwapAccess;
        this.destNoSwapAccess = !!dest && this._slotsMap[dest] && !this._slotsMap[dest].hasSwapAccess;

        const siteAuthConflicts: string[] = [];
        if (multiPhase) {
            [src, dest].forEach(r => {
                if (!!r && this._slotsMap[r] && this._slotsMap[r].hasSiteAuth) {
                    siteAuthConflicts.push(r);
                }
            })

        }
        this.siteAuthConflicts = siteAuthConflicts.length === 0 ? null : siteAuthConflicts;

        // TODO [andimarc]: make sure neither src or dest slot have targetSwapSlot set (unless this is phase two of a swap and the value match up)

        this.isValid = !this.slotsNotUnique
            && !this.srcNotSelected
            && !this.destNotSelected
            && !this.srcNoSwapAccess
            && !this.destNoSwapAccess
            && !this.siteAuthConflicts;

        if (this.isValid) {
            this._diffSubject.next(`${src},${dest}`);
        }
    }

    private _getSlotInfo(resourceId: ResourceId, force?: boolean): Observable<SlotInfo> {
        const slotInfo: SlotInfo = resourceId ? this._slotsMap[resourceId] : null;

        const needsFetch = slotInfo && (slotInfo.hasSiteAuth === undefined || slotInfo.hasSwapAccess === undefined);

        if (needsFetch || force) {
            return Observable.zip(
                this._authZService.hasPermission(slotInfo.siteArm.id, [AuthzService.writeScope]),
                this._authZService.hasPermission(slotInfo.siteArm.id, [AuthzService.actionScope]),
                this._authZService.hasReadOnlyLock(slotInfo.siteArm.id),
                this._siteService.getSiteConfig(slotInfo.siteArm.id))
                .mergeMap(r => {
                    const hasWritePermission = r[0];
                    const hasSwapPermission = r[1];
                    const hasReadOnlyLock = r[2];
                    const siteConfigResult = r[3];

                    const hasSwapAccess = hasWritePermission && hasSwapPermission && !hasReadOnlyLock;
                    const hasSiteAuth = siteConfigResult.result && siteConfigResult.result.properties.siteAuthEnabled;
                    return Observable.of({
                        siteArm: slotInfo.siteArm,
                        hasSiteAuth: hasSiteAuth,
                        hasSwapAccess: hasSwapAccess
                    });
                });
        } else {
            return Observable.of(slotInfo);
        }
    }

    closePanel() {
        const close = (!this.swapForm || !this.swapForm.dirty || this.phase === 'complete') ? true : confirm('unsaved changes will be lost'); // TODO [andimarc]: add to resources

        if (close) {
            this.close.next(!!this._swappedOrCancelled);
        }
    }

    private _getSlotsDiffs(src: string, dest: string): Observable<ArmArrayResult<SlotsDiff>> {
        const srcDescriptor: ArmSiteDescriptor = new ArmSiteDescriptor(src);
        const path = srcDescriptor.getTrimmedResourceId() + '/slotsdiffs';

        const destDescriptor: ArmSiteDescriptor = new ArmSiteDescriptor(dest);
        const content = {
            targetSlot: destDescriptor.slot || 'production'
        }

        return this._cacheService.postArm(path, null, null, content)
            .mergeMap(r => {
                return Observable.of(r.json());
            })
            .catch(e => {
                return Observable.of(null);
            });
    }

    swap() {
        this._submit('swap');
    }

    cancelMultiPhaseSwap() {
        this._submit('cancel');
    }

    private _submit(operationType: 'swap' | 'cancel') {
        this.dirtyMessage = this._translateService.instant(PortalResources.swapOperationInProgressWarning);

        if (this.isValid) { // TODO [andimarc]: check if form is valid
            if (this.swapForm.controls['multiPhase'].value && !this.phase) {
                this.phase = operationType === 'swap' ? 'phaseOne' : 'phaseTwo';
            }

            const srcId = this.swapForm.controls['src'].value;
            const destId = this.swapForm.controls['dest'].value;

            const srcDescriptor: ArmSiteDescriptor = new ArmSiteDescriptor(srcId);
            const destDescriptor: ArmSiteDescriptor = new ArmSiteDescriptor(destId);

            const srcName = srcDescriptor.slot || 'production';
            const destName = destDescriptor.slot || 'production';

            let path = srcDescriptor.getTrimmedResourceId();
            let content = null;
            let swapType = this._translateService.instant(PortalResources.swapFull);

            if (operationType === 'swap') {
                path += (this.phase === 'phaseOne' ? '/applyslotconfig' : '/slotsswap');

                content = { targetSlot: destName };

                if (this.phase === 'phaseOne') {
                    swapType = this._translateService.instant(PortalResources.swapPhaseOne);
                } else if (this.phase === 'phaseTwo') {
                    swapType = this._translateService.instant(PortalResources.swapPhaseTwo);
                }
            } else {
                path += '/resetSlotConfig';
            }

            const operation = this._translateService.instant(PortalResources.swapOperation, { swapType: swapType, srcSlot: srcName, destSlot: destName });

            const startMessageResourceString = operationType === 'swap' ? PortalResources.swapStarted : PortalResources.swapCancelStarted;
            const startMessage = this._translateService.instant(startMessageResourceString, { operation: operation });

            this.setBusy();
            this.swapping = true;
            let notificationId = null;

            this._portalService.startNotification(
                startMessage,
                startMessage)
                .first()
                .switchMap(s => {
                    notificationId = s.id;

                    return this._cacheService.postArm(path, null, null, content)
                        .mergeMap(r => {
                            if (operationType === 'swap' && (!this.phase || this.phase === 'phaseTwo')) {
                                const location = r.headers.get('Location');
                                if (!location) {
                                    return Observable.of({ success: false, error: 'no location header' });
                                } else {
                                    return Observable.interval(1000)
                                        .concatMap(_ => this._cacheService.get(location))
                                        .map((r: Response) => r.status)
                                        .take(30 * 60 * 1000)
                                        .filter(s => s !== 202)
                                        .map(r => { return { success: true, error: null } })
                                        .catch(e => Observable.of({ success: false, error: e }))
                                        .take(1);
                                }
                            } else {
                                return Observable.of({ success: true, error: null });
                            }
                        })
                        .catch(e => {
                            return Observable.of({ success: false, error: e })
                        })
                })
                .subscribe(r => {
                    this.dirtyMessage = null;
                    this.clearBusy();
                    this.swapping = false;

                    let resultMessage;

                    if (!r.success) {
                        this._logService.error(LogCategories.deploymentSlots, '/deployment-slots', r.error);

                        const failureResourceString = operationType === 'swap' ? PortalResources.swapFailure : PortalResources.swapCancelFailure;
                        resultMessage = this._translateService.instant(failureResourceString, { operation: operation, error: JSON.stringify(r.error) });

                        // TODO [andimarc]: display error message in an error info box?

                    } else {
                        if (operationType === 'swap') {
                            resultMessage = this._translateService.instant(PortalResources.swapSuccess, { operation: operation })

                            if (!this.phase || this.phase === 'phaseTwo') {
                                this.phase = 'complete';
                                this.successMessage = resultMessage;
                            } else {
                                this.phase = 'phaseTwo';
                                this.previewLink = 'https://' + (this._slotsMap[srcId] as SlotInfo).siteArm.properties.hostNames[0];
                            }
                        } else {
                            resultMessage = this._translateService.instant(PortalResources.swapCancelSuccess, { operation: operation })
                            this.phase = 'phaseOne';
                        }

                        this._swappedOrCancelled = true;

                        // TODO [andimarc]: refresh the _slotsMap entries for the slot(s) involved in the swap
                    }

                    this._portalService.stopNotification(
                        notificationId,
                        r.success,
                        resultMessage);
                });
        }
    }
}