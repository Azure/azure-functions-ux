import { NgZone } from '@angular/core';

import { ISwaggerEditor } from './ISwaggerEditor';

export class SwaggerEditor implements ISwaggerEditor {
    private editor: ISwaggerEditor;
    private zone: NgZone;

    constructor(editor: ISwaggerEditor, zone: NgZone) {
        this.editor = editor;
        this.zone = zone;
    }

    public getDocument(callback: (json: string, error: any) => void): void {
        this.editor.getDocument((arg, error) => {
            this.zone.run(() => callback(arg, error))
        });
    }

    public setDocument(swaggerObject): void {
        this.zone.run(() => {
            this.editor.setDocument(swaggerObject);
        });
    }
}
