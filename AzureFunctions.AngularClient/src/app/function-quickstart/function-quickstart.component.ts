import { Dom } from './../shared/Utilities/dom';
import { KeyCodes } from './../shared/models/constants';
import { Observable } from 'rxjs/Observable';
import { FunctionAppContext, FunctionsService } from './../shared/services/functions-service';
import { Site } from './../shared/models/arm/site';
import { ArmObj } from './../shared/models/arm/arm-obj';
import { SiteDescriptor } from 'app/shared/resourceDescriptors';
import { CacheService } from 'app/shared/services/cache.service';
import { Component, Input, OnDestroy, Injector, ViewChild, ElementRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/switchMap';
import { TranslateService } from '@ngx-translate/core';

import { AiService } from './../shared/services/ai.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { BroadcastEvent } from '../shared/models/broadcast-event';
import { FunctionTemplate } from '../shared/models/function-template';
import { FunctionInfo } from '../shared/models/function-info';
import { PortalService } from '../shared/services/portal.service';
import { BindingManager } from '../shared/models/binding-manager';
import { ErrorEvent, ErrorType } from '../shared/models/error-event';
import { GlobalStateService } from '../shared/services/global-state.service';
import { PortalResources } from '../shared/models/portal-resources';
import { ErrorIds } from '../shared/models/error-ids';
import { FunctionsNode } from '../tree-view/functions-node';
import { FunctionApp } from '../shared/function-app';
import { TreeViewInfo } from '../tree-view/models/tree-view-info';
import { DashboardType } from '../tree-view/models/dashboard-type';


type TemplateType = 'HttpTrigger' | 'TimerTrigger' | 'QueueTrigger';

@Component({
    selector: 'function-quickstart',
    templateUrl: './function-quickstart.component.html',
    styleUrls: ['./function-quickstart.component.scss'],
    inputs: ['viewInfoInput']
})

export class FunctionQuickstartComponent implements OnDestroy {
    @Input() functionsInfo: FunctionInfo[];
    private context: FunctionAppContext;

    selectedFunction: string;
    selectedLanguage: string;
    bc: BindingManager = new BindingManager();
    showJavaSplashPage = false;
    setShowJavaSplashPage = new Subject<boolean>();
    templateTypeOptions: TemplateType[] = ['HttpTrigger', 'TimerTrigger', 'QueueTrigger'];

    public functionApp: FunctionApp;
    private functionsNode: FunctionsNode;
    private _viewInfoStream = new Subject<TreeViewInfo<any>>();

    @ViewChild('http') httpTemplate: ElementRef;
    @ViewChild('timer') timerTemplate: ElementRef;
    @ViewChild('queue') queueTemplate: ElementRef;

    constructor(private _broadcastService: BroadcastService,
        private _portalService: PortalService,
        private _globalStateService: GlobalStateService,
        private _translateService: TranslateService,
        private _aiService: AiService,
        private _cacheService: CacheService,
        private _injector: Injector,
        private _functionsService: FunctionsService) {

        this.selectedFunction = 'HttpTrigger';
        this.selectedLanguage = 'CSharp';

        this._viewInfoStream
            .switchMap(viewInfo => {
                this._globalStateService.setBusyState();
                this.functionsNode = <FunctionsNode>viewInfo.node;
                const descriptor = new SiteDescriptor(viewInfo.resourceId);
                return Observable.zip(
                    this._cacheService.getArm(descriptor.getTrimmedResourceId()),
                    this._functionsService.getAppContext(descriptor.getTrimmedResourceId()),
                    (s, c) =>({ siteResponse: s, context: c}))
            })
            .switchMap(r => {
                const site: ArmObj<Site> = r.siteResponse.json();
                this.context = r.context;

                if (this.functionApp) {
                    this.functionApp.dispose();
                }

                this.functionApp = new FunctionApp(site, this._injector);

                return this.functionApp.getFunctions();
            })
            .do(null, e => {
                this._aiService.trackException(e, '/errors/function-quickstart');
                console.error(e);
            })
            .retry()
            .subscribe(fcs => {
                this._globalStateService.clearBusyState();
                this.functionsInfo = fcs;
            });

        this.setShowJavaSplashPage.subscribe(show => {
            this.showJavaSplashPage = show;
        });
    }

    set viewInfoInput(viewInfoInput: TreeViewInfo<any>) {
        this._viewInfoStream.next(viewInfoInput);

    }

    ngOnDestroy() {
        if (this.functionApp) {
            this.functionApp.dispose();
        }
    }

    onFunctionClicked(selectedFunction: string) {
        if (!this._broadcastService.getDirtyState('function_disabled')) {
            this.selectedFunction = selectedFunction;
        }
    }


    onFunctionKey(event: KeyboardEvent, currentFunction: TemplateType) {
        const currentIndex = this.templateTypeOptions.indexOf(currentFunction);
        let nextIndex: number;

        if (event.keyCode === KeyCodes.arrowRight) {
            nextIndex = currentIndex + 1;
            nextIndex = nextIndex > this.templateTypeOptions.length - 1 ? 0 : nextIndex;
        } else if (event.keyCode === KeyCodes.arrowLeft) {
            nextIndex = currentIndex - 1;
            nextIndex = nextIndex < 0 ? this.templateTypeOptions.length - 1 : nextIndex;
        } else {
            return;
        }

        const nextFunction = this.templateTypeOptions[nextIndex];
        switch (nextFunction) {
            case 'HttpTrigger':
            {
                Dom.setFocus(Dom.getTabbableControl(this.httpTemplate.nativeElement));
                this.onFunctionClicked('HttpTrigger');
                break;
            }
            case 'TimerTrigger' :
            {
                Dom.setFocus(Dom.getTabbableControl(this.timerTemplate.nativeElement));
                this.onFunctionClicked('TimerTrigger');
                break;
            }
            case 'QueueTrigger' :
            {
                Dom.setFocus(Dom.getTabbableControl(this.queueTemplate.nativeElement));
                this.onFunctionClicked('QueueTrigger');
                break;
            }
        }

        // if (event.keyCode === KeyCodes.arrowRight) {
        //     switch (currentFunction) {
        //         case 'HttpTrigger':
        //         {
        //             Dom.setFocus(Dom.getTabbableControl(this.timerTemplate.nativeElement));
        //             this.onFunctionClicked('TimerTrigger');
        //             break;
        //         }
        //         case 'TimerTrigger' :
        //         {
        //             Dom.setFocus(Dom.getTabbableControl(this.queueTemplate.nativeElement));
        //             this.onFunctionClicked('QueueTrigger');
        //             break;
        //         }
        //         case 'QueueTrigger' :
        //         {
        //             Dom.setFocus(Dom.getTabbableControl(this.httpTemplate.nativeElement));
        //             this.onFunctionClicked('HttpTrigger');
        //             break;
        //         }
        //     }
        // } else if (event.keyCode === KeyCodes.arrowLeft) {
        //     switch (currentFunction) {
        //         case 'HttpTrigger':
        //         {
        //             Dom.setFocus(Dom.getTabbableControl(this.queueTemplate.nativeElement));
        //             this.onFunctionClicked('QueueTrigger');
        //             break;
        //         }
        //         case 'TimerTrigger' :
        //         {
        //             Dom.setFocus(Dom.getTabbableControl(this.httpTemplate.nativeElement));
        //             this.onFunctionClicked('HttpTrigger');
        //             break;
        //         }
        //         case 'QueueTrigger' :
        //         {
        //             Dom.setFocus(Dom.getTabbableControl(this.timerTemplate.nativeElement));
        //             this.onFunctionClicked('TimerTrigger');
        //             break;
        //         }
        //     }
        // }

    }

    onLanguageClicked(selectedLanguage: string) {
        if (!this._broadcastService.getDirtyState('function_disabled')) {
            this.selectedLanguage = selectedLanguage;
        }
    }

    onCreateNewFunction() {
        if (this._globalStateService.IsBusy) {
            return;
        }

        this._globalStateService.setBusyState();

        if (this.selectedLanguage === 'Java') {
            this.setShowJavaSplashPage.next(true);
        }
        this.functionApp.getTemplates().subscribe((templates) => {
            const selectedTemplate: FunctionTemplate = templates.find((t) => {
                return t.id === this.selectedFunction + '-' + this.selectedLanguage;
            });

            if (selectedTemplate) {
                try {
                    const functionName = BindingManager.getFunctionName(selectedTemplate.metadata.defaultFunctionName, this.functionsInfo);
                    this._portalService.logAction('intro-create-from-template', 'creating', { template: selectedTemplate.id, name: functionName });

                    this.bc.setDefaultValues(selectedTemplate.function.bindings, this._globalStateService.DefaultStorageAccount);

                    this.functionApp.createFunctionV2(functionName, selectedTemplate.files, selectedTemplate.function)
                        .subscribe(res => {
                            this._portalService.logAction('intro-create-from-template', 'success', { template: selectedTemplate.id, name: functionName });
                            res.context = this.context;
                            this.functionsNode.addChild(res);
                            // this._broadcastService.broadcast<TutorialEvent>(
                            //    BroadcastEvent.TutorialStep,
                            //    {
                            //        functionInfo: res,
                            //        step: TutorialStep.Waiting
                            //    });
                            //this._broadcastService.broadcast(BroadcastEvent.FunctionAdded, res);
                            this._globalStateService.clearBusyState();
                        },
                        () => {
                            this._globalStateService.clearBusyState();
                        });
                } catch (e) {
                    this._broadcastService.broadcast<ErrorEvent>(BroadcastEvent.Error, {
                        message: this._translateService.instant(PortalResources.functionCreateErrorMessage),
                        details: this._translateService.instant(PortalResources.functionCreateErrorDetails, { error: JSON.stringify(e) }),
                        errorId: ErrorIds.unableToCreateFunction,
                        errorType: ErrorType.UserError,
                        resourceId: this.functionApp.site.id
                    });
                    this._aiService.trackEvent(ErrorIds.unableToCreateFunction, {
                        exception: e
                    });
                    throw e;
                }
            } else {
                this._globalStateService.clearBusyState();
            }

        });
    }

    createFromScratch() {
        const functionsNode = this.functionsNode;
        functionsNode.openCreateDashboard(DashboardType.CreateFunctionDashboard);
    }

    startFromSC() {
        this._portalService.openBlade({
            detailBlade: 'ContinuousDeploymentListBlade',
            detailBladeInputs: {
                id: this.functionApp.site.id,
                ResourceId: this.functionApp.site.id
            }
        },
            'intro');
    }

    onKeyDown(event: KeyboardEvent, command: string) {
        if (event.keyCode === KeyCodes.enter) {
            switch (command) {
                case 'scratch':
                {
                    this.createFromScratch();
                    break;
                }
                case 'SC' :
                {
                    this.startFromSC();
                    break;
                }
            }
        }
    }

}
