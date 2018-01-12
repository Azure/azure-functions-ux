import { BroadcastService } from 'app/shared/services/broadcast.service';
import { OnDestroy, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TreeViewInfo } from 'app/tree-view/models/tree-view-info';
import { FunctionAppContext } from 'app/shared/function-app-context';
import { FunctionAppHttpResult } from 'app/shared/models/function-app-http-result';
import { FunctionInfo } from 'app/shared/models/function-info';
import { SiteDescriptor, FunctionDescriptor } from 'app/shared/resourceDescriptors';
import { Subject } from 'rxjs/Subject';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { Subscription } from 'rxjs/Subscription';
import { ErrorableComponent } from './errorable-component';
import { ReplaySubject } from 'rxjs/ReplaySubject';


export abstract class FunctionAppContextComponent extends ErrorableComponent implements OnDestroy {
    public viewInfo: TreeViewInfo<any>;
    public context: FunctionAppContext;

    protected viewInfoEvents: Observable<TreeViewInfo<any> & {
        siteDescriptor: SiteDescriptor | null;
        functionDescriptor: FunctionDescriptor | null;
        context: FunctionAppContext | null;
        functionInfo: FunctionAppHttpResult<FunctionInfo> | null;
    }>;
    protected ngUnsubscribe: Observable<void>;

    private subscription: Subscription;
    private viewInfoSubject: ReplaySubject<TreeViewInfo<any>>;
    private timeout: number;

    @Input('viewInfo')
    private set viewInfoComponent_viewInfo(viewInfo: TreeViewInfo<any>) {
        this.viewInfoSubject.next(viewInfo);
    }

    constructor(componentName: string, functionAppService: FunctionAppService, broadcastService: BroadcastService, setBusy?: Function, private clearBusy?: Function) {
        super(componentName, broadcastService);

        this.ngUnsubscribe = new Subject();
        this.viewInfoSubject = new ReplaySubject(1);
        this.viewInfoEvents = this.viewInfoSubject
            .takeUntil(this.ngUnsubscribe)
            .filter(view => !!view)
            .map(view => {
                let siteDescriptor: SiteDescriptor | null;
                let functionDescriptor: FunctionDescriptor | null;
                try {
                    siteDescriptor = new SiteDescriptor(view.resourceId);
                } catch {
                    siteDescriptor = null;
                }
                try {
                    functionDescriptor = new FunctionDescriptor(view.resourceId);
                } catch {
                    functionDescriptor = null;
                }
                return Object.assign(view, {
                    siteDescriptor: siteDescriptor,
                    functionDescriptor: functionDescriptor
                });
            })
            .do(() => setBusy && setBusy())
            .switchMap(viewInfo => Observable.zip(
                functionAppService.getAppContext(viewInfo.siteDescriptor.getTrimmedResourceId()),
                Observable.of(viewInfo)
            ))
            .switchMap(tuple => {
                this.context = tuple[0];
                return Observable.zip(
                    tuple[1].functionDescriptor
                        ? functionAppService.getFunction(tuple[0], tuple[1].functionDescriptor.name)
                        : Observable.of({ isSuccessful: false, error: { errorId: '' } } as FunctionAppHttpResult<FunctionInfo>),
                    Observable.of(tuple[0]),
                    Observable.of(tuple[1])
                );
            })
            .map(tuple => Object.assign(tuple[2], {
                context: tuple[1],
                functionInfo: tuple[0]
            }))
            .do(v => {
                this.viewInfo = v;
                this.context = v.context;
            });

        this.timeout = setTimeout(() => {
            this.subscription = this.setup();
        });
    }

    setup(): Subscription {
        return this.viewInfoEvents
            .takeUntil(this.ngUnsubscribe)
            .subscribe(() => {
                if (typeof this.clearBusy === 'function') {
                    this.clearBusy();
                }
            });
    }

    ngOnDestroy(): void {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        (this.ngUnsubscribe as Subject<void>).next();
    }
}
