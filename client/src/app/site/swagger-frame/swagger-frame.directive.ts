import { Directive, ElementRef, NgZone, Output, EventEmitter } from '@angular/core';
import { ISwaggerEditor } from './ISwaggerEditor';
import { SwaggerEditor } from './swaggerEditor';

@Directive({
    selector: 'swagger-frame'
})
export class SwaggerFrameDirective {
    private element: Element;
    private iframeElement: HTMLIFrameElement;

    @Output()
    public onSwaggerEditorReady: EventEmitter<ISwaggerEditor>;

    constructor(elementRef: ElementRef, private zone: NgZone) {
        this.element = elementRef.nativeElement;
        this.onSwaggerEditorReady = new EventEmitter<ISwaggerEditor>();
    }

    private onFrameLoaded(): void {
        const iswaggerEditor = this.iframeElement.contentDocument['iswaggerEditor'];

        if (iswaggerEditor) {
            this.initiateSwaggerEditor(iswaggerEditor);
        } else {
            this.iframeElement.contentDocument.addEventListener('iswaggerEditorReady', this.onISwaggerEditorReady.bind(this));
        }
    }

    private onISwaggerEditorReady(event: CustomEvent): void {
        this.initiateSwaggerEditor(event.detail as ISwaggerEditor);
    }

    private initiateSwaggerEditor(iswaggerEditor: ISwaggerEditor): void {
        const swaggerEditor = new SwaggerEditor(iswaggerEditor, this.zone);

        this.zone.run(() => {
            this.onSwaggerEditorReady.emit(swaggerEditor);
        });
    }

    public ngOnInit(): void {
        this.iframeElement = document.createElement('iframe');
        this.iframeElement.id = 'SwaggerFrame';
        this.iframeElement.setAttribute('src', '../node_modules/swagger-editor/index.html');
        this.iframeElement.setAttribute('frameborder', '0');
        this.iframeElement.setAttribute('style', 'width: 100%; height: 100%;');
        this.iframeElement.onload = this.onFrameLoaded.bind(this);
        this.element.appendChild(this.iframeElement);
    }
}
