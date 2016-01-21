import {Directive, EventEmitter, ElementRef} from 'angular2/core';
import {AceEditor} from '../models/ace-editor';
import {VfsObject} from '../models/vfs-object';
import {FunctionsService} from '../services/functions.service';

declare var ace: any;

@Directive({
    selector: '[aceEditor]',
    inputs: ['fileObject', 'content', 'height'],
    outputs: ['contentChanged']
})
export class AceEditorDirective {
    private editor: AceEditor;
    private currentFileObject: VfsObject;
    public contentChanged: EventEmitter<string>;
    private initialHeight: number;

    constructor(private elementRef: ElementRef, private functionsService: FunctionsService) {
        this.contentChanged = new EventEmitter<string>();
        this.initialHeight = window.innerHeight;

        let el = elementRef.nativeElement;
        el.classList.add("editor");
        el.style.width = "100%";
        this.editor = ace.edit(el);
        this.editor.setTheme("ace/theme/github");
        this.editor.getSession().setTabSize(4);
        this.editor.getSession().setUseSoftTabs(true);
        this.editor.$blockScrolling = Infinity;
        this.editor.setOptions({
            "showPrintMargin": false,
            "fontSize": 14
        });

        this.editor.on("change", (e) => {
            // (Attempt to) separate user change from programatical
            // https://github.com/ajaxorg/ace/issues/503
            if (this.editor.curOp && this.editor.curOp.command.name) {
                this.contentChanged.next(this.editor.getValue());
            }
        });

        this.editor.commands.addCommand({
            name: 'saveItem',
            bindKey: {
                win: 'Ctrl-S',
                mac: 'Command-S',
                sender: 'editor|cli'
            },
            exec: () => this.functionsService.saveFile(this.currentFileObject, this.editor.getValue())
                            .subscribe(r => this.currentFileObject.isDirty = false)
        });

        this.resizeAce();
        this.editor.focus();
        // Attach event handler to set new Ace height on browser resize
        window.onresize = () => this.resizeAce();
    }

    set height(h: number) {
        this.initialHeight = h;
        this.resizeAce();
    }

    set content(str: string) {
        this.editor.setValue(str);
        this.editor.clearSelection();
        this.editor.moveCursorTo(0, 0);
        this.editor.focus();
    }

    set fileObject(file: VfsObject) {
        if (file.isNew) {
            this.editor.setValue('');
        }
        this.currentFileObject = file;
        this.editor.session.setMode(this.getMode(file.name));
    }

    getMode(filename: string): string {
        var _config = (/^(web|app).config$/i);
        var _csproj = (/.(cs|vb)proj$/i);
        var _xdt = (/.xdt$/i);
        var _aspnet = (/.(cshtml|asp|aspx)$/i);
        var syntax_mode = 'ace/mode/text';
        var modelist = ace.require('ace/ext/modelist');
        syntax_mode = modelist.getModeForPath(filename).mode;
        if (syntax_mode === 'ace/mode/text') {
            if (
                filename.match(_config) ||
                filename.match(_csproj) ||
                filename.match(_xdt)
            ) {
                syntax_mode = 'ace/mode/xml';
            }
            if (filename.match(_aspnet)) {
                syntax_mode = 'ace/mode/csharp';
            }
        }
        return syntax_mode;
    }

    resizeAce() {
        // http://stackoverflow.com/questions/11584061/
        var new_height = (this.initialHeight - 200) + 'px';
        this.elementRef.nativeElement.style.height = new_height;
        this.editor.resize();
    }
}