import { HostEvent } from '../shared/models/host-event';
import { Disposable } from 'app/shared/models/disposable';
import { Observable } from 'rxjs/Observable';
import { FunctionAppContext } from './function-app-context';
import { Subject } from 'rxjs/Subject';
import { UserService } from './services/user.service';
import { Subscription } from 'rxjs/Subscription';


export class HostEventClient implements Disposable {
    private events: Subject<HostEvent>;
    private processedEvents: Observable<HostEvent>;
    private tokenSubscription: Subscription;
    private req: XMLHttpRequest;
    private timeouts: number[] = [];
    private currentPosition = 0;
    // The point of having this map is because the UI is function specific
    // while the structured logs are host wide logs.
    // as we're reading logs, we should only return the logs for the current function
    // but when the user switches to another one, it's better to directly load its logs
    // if we saw them before. This map allows us to do that.
    private functionEventsMap: { [key: string]: HostEvent } = {};

    constructor(private context: FunctionAppContext, private userService: UserService) {
        // events holds the raw events being pushed from the structured logs stream
        this.events = new Subject<HostEvent>();

        // processedEvents is the same as raw events, but updates functionEventsMap with the latest errors-warnings for a function
        this.processedEvents = this.events
            .do(e => {
                this.functionEventsMap[e.functionName] = e;
            });
        this.readHostEvents();
    }

    get id(): string {
        return this.context.site.id;
    }

    dispose() {
        if (this.req) {
            // make sure to kill the request
            if (this.timeouts) {
                this.timeouts.forEach(window.clearTimeout);
                this.timeouts = [];
            }
            this.req.abort();
        }
        if (this.tokenSubscription) {
            this.tokenSubscription.unsubscribe();
        }
        delete this.functionEventsMap;
        this.events.complete();
    }

    getEvents(functionName: string): Observable<HostEvent> {
        if (this.functionEventsMap[functionName]) {
            // if there were already logs for this function, prepend them to the stream
            return Observable.concat(
                Observable.of(this.functionEventsMap[functionName]),
                this.processedEvents.filter(e => e.functionName === functionName));
        } else {
            // otherwise, prepend an empty list to clear any previous logs we have sent
            return Observable.concat(
                Observable.of({
                    id: '',
                    name: '',
                    functionName: functionName,
                    diagnostics: []
                }),
                this.processedEvents.filter(e => e.functionName === functionName));
        }
    }

    public readHostEvents(createEmpty: boolean = true, log?: string) {
        this.tokenSubscription = this.userService.getStartupInfo()
            .subscribe(info => {
                // re-establish the connection if the token changes
                const defaultInterval = 500;
                const url = `${this.context.scmUrl}/api/logstream/application/functions/structured`;
                if (this.req) {
                    // make sure to kill any previous connections
                    if (this.timeouts) {
                        this.timeouts.forEach(window.clearTimeout);
                        this.timeouts = [];
                    }
                    this.req.abort();
                }

                this.req = new XMLHttpRequest();
                this.req.open('GET', url, true);
                this.req.setRequestHeader('Authorization', `Bearer ${info.token}`);
                // needed to disable response buffering
                this.req.setRequestHeader('FunctionsPortal', '1');
                this.req.send(null);

                const callBack = () => {
                    const diff = this.req.responseText.length - this.currentPosition;
                    if (diff > 0) {
                        if (this.req.responseText.length) {
                            const newText: string = this.req.responseText.substring(this.currentPosition);
                            const lines = newText.split('\n');

                            lines
                                .filter(l => l.startsWith('[') || l.startsWith('{'))
                                .map(l => l.startsWith('[') ? l.substring('[Verbose] '.length) : l)
                                .filter(l => l.startsWith('{'))
                                .map(l => {
                                    try {
                                        return JSON.parse(l);
                                    } catch (e) {
                                        console.error(e);
                                        return null;
                                    }
                                })
                                .forEach(e => {
                                    if (e !== null) {
                                        this.events.next(e);
                                    }
                                });

                            this.currentPosition += newText.lastIndexOf('\n');
                        }
                    }

                    if (this.req.readyState === XMLHttpRequest.DONE) {
                        this.readHostEvents();
                    } else {
                        this.timeouts.push(window.setTimeout(callBack, defaultInterval));
                    }
                };
                callBack();
            });
    }
}
