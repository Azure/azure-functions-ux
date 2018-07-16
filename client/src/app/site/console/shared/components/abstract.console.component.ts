import { OnInit, OnDestroy, ComponentFactoryResolver, ComponentFactory, ComponentRef, ViewChild, ViewContainerRef, ElementRef, Input } from '@angular/core';
import { ArmObj } from '../../../../shared/models/arm/arm-obj';
import { Site } from '../../../../shared/models/arm/site';
import { PublishingCredentials } from '../../../../shared/models/publishing-credentials';
import { Subscription } from 'rxjs/Subscription';
import { ConsoleService } from './../services/console.service';
import { KeyCodes } from '../../../../shared/models/constants';
import { ErrorComponent } from './error.component';
import { MessageComponent } from './message.component';
import { PromptComponent } from './prompt.component';
import { Headers } from '@angular/http';

export abstract class AbstractConsoleComponent implements OnInit, OnDestroy {
    public resourceId: string;
    public consoleType: number;
    public isFocused = false;
    public commandInParts = {leftCmd: '', middleCmd: ' ' , rightCmd: ''}; // commands to left, right and on the pointer
    public dir: string;
    public initialized = false;
    protected site: ArmObj<Site>;
    protected publishingCredentials: ArmObj<PublishingCredentials>;
    /*** Variables for Tab-key ***/
    protected listOfDir: string[] = [];
    protected dirIndex = -1;
    protected lastAPICall: Subscription = undefined;
    /*** Variables for Command + Dir @Input ***/
    protected command = '';
    protected ptrPosition = 0;
    protected commandHistory: string[] = [''];
    protected commandHistoryIndex = 1;
    private _lastKeyPressed = -1;
    private _promptComponent: ComponentFactory<any>;
    private _messageComponent: ComponentFactory<any>;
    private _errorComponent: ComponentFactory<any>;
    private _msgComponents: ComponentRef<any>[] = [];
    private _currentPrompt: ComponentRef<any> = null;
    private _resourceIdSubscription: Subscription;
    private _siteSubscription: Subscription;
    private _publishingCredSubscription: Subscription;

    @Input()
    public appName: string;
    /**
     * UI Elements
     */
    @ViewChild('prompt', {read: ViewContainerRef})
    private _prompt: ViewContainerRef;
    @ViewChild('consoleText')
    private _consoleText: ElementRef;

    constructor(
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _consoleService: ConsoleService) {
    }

    ngOnInit() {
        this._resourceIdSubscription = this._consoleService.getResourceId().subscribe(resourceId => {
            this.resourceId = resourceId; });
        this._siteSubscription = this._consoleService.getSite().subscribe(site => {
            this.site = site; });
        this._publishingCredSubscription = this._consoleService.getPublishingCredentials().subscribe(publishingCredentials => {
            this.publishingCredentials = publishingCredentials;
        });
        this.initialized = true;
        this.focusConsole();
    }

    ngOnDestroy() {
        this._resourceIdSubscription.unsubscribe();
        this._siteSubscription.unsubscribe();
        this._publishingCredSubscription.unsubscribe();
        if (this.lastAPICall && !this.lastAPICall.closed) {
            this.lastAPICall.unsubscribe();
        }
    }

    /**
     * Mouse Press outside the console,
     * i.e. the console no longer in focus
     */
    unFocusConsole() {
        this.isFocused = false;
        this._renderPromptVariables();
    }

    /**
     * Console brought to focus when textarea comes into focus
     */
    focusConsoleOnTabPress() {
        this.isFocused = true;
        this._renderPromptVariables();
    }

    /**
     * Mouse press inside the console, i.e. console comes into focus.
     * If already in focus, the console remains to be in focus.
     */
    focusConsole() {
        this.isFocused = true;
        this._renderPromptVariables();
        this._consoleText.nativeElement.focus();
    }

    /**
     * Handle the paste event when in focus
     * @param event: KeyEvent (paste in particular)
     */
    handlePaste(event) {
        const text = event.clipboardData.getData('text/plain');
        this.command += text;
        this.ptrPosition = this.command.length;
        this.divideCommandForPtr();
    }

    /**
     * Handle the right mouse click
     * @param event: MouseEvent, particularly right-click
     */
    handleRightMouseClick(event): boolean {
        return false;
    }

    /**
     * Handle the copy event when in focus
     * @param event: Keyevent (copy in particular)
     */
    handleCopy(event) {
        if (!this.lastAPICall) {
        this._removePrompt();
        this.addMessageComponent();
        } else if (!this.lastAPICall.closed) {
        this.lastAPICall.unsubscribe();
        }
        this._resetCommand();
        this.addPromptComponent();
    }

    /**
     * Handles the key event of the keyboard,
     * is called only when the console is in focus.
     * @param event: KeyEvent
     */
    keyEvent(event) {
        /**
         * Switch case on the key number
         */
        switch (event.which) {
        case KeyCodes.backspace: {
            this._backspaceKeyEvent();
            break;
        }
        case KeyCodes.tab: {
            event.preventDefault();
            this.tabKeyEvent();
            return;
        }
        case KeyCodes.enter: {
            this._enterKeyEvent();
            break;
        }

        case KeyCodes.escape: {
            this._resetCommand();
            break;
        }

        case KeyCodes.space: {
            this._appendToCommand(' ');
            break;
        }

        case KeyCodes.arrowLeft: {
            this._leftArrowKeyEvent();
            break;
        }

        case KeyCodes.arrowUp: {
            this._topArrowKeyEvent();
            break;
        }

        case KeyCodes.arrowRight: {
            this._rightArrowKeyEvent();
            break;
        }

        case KeyCodes.arrowDown: {
            this._downArrowKeyEvent();
            break;
        }

        default: {
            this._appendToCommand(event.key, event.which);
            break;
        }
        }
        this._lastKeyPressed = event.which;
        this._renderPromptVariables();
        this._refreshTabFunctionElements();
    }

    /**
     * Get the command to list all the directories for the specific console-type
     */
    protected abstract getTabKeyCommand(): string;

    /**
    * perform action on key pressed.
    */
    protected abstract performAction(cmd?: string): boolean;

    /**
     * Handle the tab-pressed event
     */
    protected abstract tabKeyEvent();

    /**
     * Get Kudu API URL
     */
    protected abstract getKuduUri(): string ;

    /**
     * Get the left-hand-side text for the console
     */
    protected abstract getConsoleLeft();

    /**
    * Connect to the kudu API and display the response;
    * both incase of an error or a valid response
    */
    protected abstract connectToKudu();

    /**
     * Get the header to connect to the KUDU API.
     */
    protected getHeader(): Headers {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        headers.append('Accept', 'application/json');
        headers.append('Authorization', `Basic ` + ((this.publishingCredentials) ? btoa(`${this.publishingCredentials.properties.publishingUserName}:${this.publishingCredentials.properties.publishingPassword}`) : btoa(`admin:kudu`)));
        return headers;
    }

    /**
    * Remove all the message history
    */
    protected removeMsgComponents() {
        let len = this._msgComponents.length;
        while (len > 0) {
            --len;
            this._msgComponents.pop().destroy();
        }
    }

    /**
     * Add a message component, this is usually called after user presses enter
     * and we have a response from the Kudu API(might be an error).
     * @param message: String, represents a message to be passed to be shown
     */
    protected addMessageComponent(message?: string) {
        if (!this._messageComponent) {
            this._messageComponent = this._componentFactoryResolver.resolveComponentFactory(MessageComponent);
        }
        const msgComponent = this._prompt.createComponent(this._messageComponent);
        msgComponent.instance.loading = (message ? false : true);
        msgComponent.instance.message = (message ? message : (this.getConsoleLeft() + this.command));
        this._msgComponents.push(msgComponent);
    }

    /**
     * Creates a new prompt box,
     * created everytime a command is entered by the user and
     * some response is generated from the server, or 'cls', 'exit'
     */
    protected addPromptComponent() {
        if (!this._promptComponent) {
            this._promptComponent = this._componentFactoryResolver.resolveComponentFactory(PromptComponent);
        }
        this._currentPrompt = this._prompt.createComponent(this._promptComponent);
        this._currentPrompt.instance.dir = this.getConsoleLeft();
        this._currentPrompt.instance.consoleType = this.consoleType;
        // hide the loader on the last 2 msg-components
        this._msgComponents[this._msgComponents.length - 1].instance.loading = false;
        if (this._msgComponents.length > 1) {
            this._msgComponents[this._msgComponents.length - 2].instance.loading = false;
        }
    }

    /**
     * Create a error message
     * @param error : String, represents the error message to be shown
     */
    protected addErrorComponent(error: string) {
        if (!this._errorComponent) {
            this._errorComponent = this._componentFactoryResolver.resolveComponentFactory(ErrorComponent);
        }
        const errorComponent = this._prompt.createComponent(this._errorComponent);
        this._msgComponents.push(errorComponent);
        errorComponent.instance.message = error;
    }

    /**
     * Divide the commands into left, current and right
     */
    protected divideCommandForPtr() {
        if (this.ptrPosition < 0 || this.ptrPosition > this.command.length) {
            return;
        }
        if (this.ptrPosition === this.command.length) {
            this.commandInParts.leftCmd = this.command;
            this.commandInParts.middleCmd = ' ';
            this.commandInParts.rightCmd = '';
            return;
        }
        this.commandInParts.leftCmd = this.command.substring(0, this.ptrPosition);
        this.commandInParts.middleCmd = this.command.substring(this.ptrPosition, this.ptrPosition + 1);
        this.commandInParts.rightCmd = this.command.substring(this.ptrPosition + 1, this.command.length);
    }

    /**
     * Left Arrow key pressed
     */
    private _leftArrowKeyEvent() {
        if (this.ptrPosition >= 1) {
            --this.ptrPosition;
            this.divideCommandForPtr();
        }
    }

    /**
     * Right Arrow key pressed
     */
    private _rightArrowKeyEvent() {
        if (this.ptrPosition < this.command.length) {
            ++this.ptrPosition;
            this.divideCommandForPtr();
        }
    }

    /**
     * Down Arrow key pressed
     */
    private _downArrowKeyEvent() {
        if (this.commandHistory.length > 0 && this.commandHistoryIndex < this.commandHistory.length - 1) {
            this.commandHistoryIndex = (this.commandHistoryIndex + 1) % (this.commandHistory.length);
            this.command = this.commandHistory[this.commandHistoryIndex];
            this.ptrPosition = this.command.length;
            this.divideCommandForPtr();
        }
    }

    /**
     * Top Arrow key pressed
     */
    private _topArrowKeyEvent() {
        if (this.commandHistoryIndex > 0) {
            this.command = this.commandHistory[this.commandHistoryIndex - 1];
            this.commandHistoryIndex = (this.commandHistoryIndex === 1 ? 0 : --this.commandHistoryIndex);
            this.ptrPosition = this.command.length;
            this.divideCommandForPtr();
        }
    }

    /**
     * Backspace pressed by the user
     */
    private _backspaceKeyEvent() {
        if (this.ptrPosition < 1) {
            return;
        }
        this.commandInParts.leftCmd = this.commandInParts.leftCmd.slice(0, -1);
        if (this.ptrPosition === this.command.length) {
            this.command = this.commandInParts.leftCmd;
            --this.ptrPosition;
            return;
        }
        this.command = this.commandInParts.leftCmd + this.commandInParts.middleCmd + this.commandInParts.rightCmd;
        --this.ptrPosition;
        this.divideCommandForPtr();
    }

    /**
     * Handle the Enter key pressed operation
     */
    private _enterKeyEvent() {
        const flag = this.performAction();
        this._removePrompt();
        this.commandHistory.push(this.command);
        this.commandHistoryIndex = this.commandHistory.length;
        if (flag) {
            this.addMessageComponent();
            this.connectToKudu();
        } else {
            this.addPromptComponent();
        }
        this._resetCommand();
    }

    /**
     * Remove the current prompt from the console
     */
    private _removePrompt() {
        const oldPrompt = document.getElementById('prompt');
        if (!oldPrompt) {
          return;
        }
        oldPrompt.remove();
    }

    /**
     * Refresh the tab elements,
     * i.e. the list of files/folder and the current dir index
     */
    private _refreshTabFunctionElements() {
        this.listOfDir.length = 0;
        this.dirIndex = -1;
    }

    /**
     * Reset the command
     */
    private _resetCommand() {
        this.command = '';
        this.commandInParts.rightCmd = '';
        this.commandInParts.leftCmd = '';
        this.commandInParts.middleCmd = ' ';
        this.ptrPosition = 0;
    }

    /**
     * Add the text to the current command
     * @param cmd :String
     */
    private _appendToCommand(cmd: string, key?: number) {
        if (key && ((key > KeyCodes.backspace && key <= KeyCodes.delete) || (key >= KeyCodes.leftWindow && key <= KeyCodes.select) || (key >= KeyCodes.f1 && key < KeyCodes.scrollLock))) {
            // key-strokes not allowed, for e.g F1-F12
            return;
        }
        if (key && (key === KeyCodes.c || key === KeyCodes.v) && this._lastKeyPressed === KeyCodes.ctrl) {
            // Ctrl + C or Ctrl + V pressed, should not append c/v to the current command
            return;
        }
        this.commandHistoryIndex = this.commandHistory.length; // reset the command-index to the last command
        if (this.ptrPosition === this.command.length) {
            this.commandInParts.leftCmd += cmd;
            this.command = this.commandInParts.leftCmd;
            ++this.ptrPosition;
            return;
        }
        this.commandInParts.leftCmd += cmd;
        this.command = this.commandInParts.leftCmd + this.commandInParts.middleCmd + this.commandInParts.rightCmd;
        ++this.ptrPosition;
    }

    /**
     * Render the dynamically loaded prompt box,
     * i.e. pass in the updated command the inFocus value to the PromptComponent.
     */
    private _renderPromptVariables() {
        if (this._currentPrompt) {
            this._currentPrompt.instance.command = this.command;
            this._currentPrompt.instance.commandInParts = this.commandInParts;
            this._currentPrompt.instance.isFocused = this.isFocused;
        }
    }
}
