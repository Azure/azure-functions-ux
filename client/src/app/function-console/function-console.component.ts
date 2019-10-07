import {
  OnDestroy,
  Component,
  ViewContainerRef,
  ViewChild,
  ComponentRef,
  ComponentFactory,
  ComponentFactoryResolver,
  EventEmitter,
  Output,
} from '@angular/core';
import { FunctionAppContextComponent } from '../shared/components/function-app-context-component';
import { FunctionAppService } from '../shared/services/function-app.service';
import { BroadcastService } from '../shared/services/broadcast.service';
import { Subscription } from 'rxjs/Subscription';
import { SiteService } from '../shared/services/site.service';
import { ArmObj } from '../shared/models/arm/arm-obj';
import { Site, HostType } from '../shared/models/arm/site';
import { PublishingCredentials } from '../shared/models/publishing-credentials';
import { CacheService } from '../shared/services/cache.service';
import { ArmUtil } from '../shared/Utilities/arm-utils';
import { KeyCodes, ConsoleConstants, HttpMethods } from '../shared/models/constants';
import { ConsoleService } from '../site/console/shared/services/console.service';
import { Headers } from '@angular/http';
import { PromptComponent } from './extra-components/prompt.component';
import { MessageComponent } from './extra-components/message.component';
import { ErrorComponent } from './extra-components/error.component';
import { UtilitiesService } from '../shared/services/utilities.service';
import { FunctionService } from 'app/shared/services/function.service';

@Component({
  selector: 'console',
  templateUrl: './function-console.component.html',
  styleUrls: ['./function-console.component.scss', '../function-dev/function-dev.component.scss'],
})
export class FunctionConsoleComponent extends FunctionAppContextComponent implements OnDestroy {
  public appName: string;
  public isLinux = false;
  public isExpanded = false;
  public command = { left: '', mid: ' ', right: '', complete: '' };
  public dir: string;
  public isFocused: boolean;
  public leftSideText = '';
  private _tabKeyPointer: number;
  private _resourceId: string;
  private _functionName: string;
  private _site: ArmObj<Site>;
  private _publishingCredentials: ArmObj<PublishingCredentials>;
  private _lastKeyPressed: number;
  private _enterPressed: boolean;
  private _ptrPosition = 0;
  private _commandHistoryIndex: number;
  private _dirIndex: number;
  private _commandHistory = [''];
  private _listOfDir: string[] = [];
  private _currentPrompt: ComponentRef<any> = null;
  private _lastAPICall: Subscription;
  private _promptComponent: ComponentFactory<any>;
  private _messageComponent: ComponentFactory<any>;
  private _errorComponent: ComponentFactory<any>;
  private _msgComponents: ComponentRef<any>[] = [];
  @ViewChild('prompt', { read: ViewContainerRef })
  private _prompt: ViewContainerRef;
  @Output()
  expandClicked = new EventEmitter<boolean>();

  constructor(
    public functionAppService: FunctionAppService,
    public broadcastService: BroadcastService,
    public functionService: FunctionService,
    private _siteService: SiteService,
    private _utilities: UtilitiesService,
    private _cacheService: CacheService,
    private _consoleService: ConsoleService,
    private _componentFactoryResolver: ComponentFactoryResolver
  ) {
    super('console', functionAppService, broadcastService, functionService);
  }

  setup(): Subscription {
    return this.viewInfoEvents.subscribe(view => {
      this.isFocused = false;
      this._resourceId = view.siteDescriptor.resourceId;
      this._functionName = view.functionDescriptor.name;
      this.clearConsole();
      this._siteService.getSite(this._resourceId).subscribe(site => {
        this._site = site.result;
        this._setConsoleDetails(ArmUtil.isLinuxApp(this._site));
      });
      this._cacheService.postArm(`${this._resourceId}/config/publishingcredentials/list`).subscribe(publishingcredentials => {
        this._publishingCredentials = publishingcredentials.json();
        this.appName = this._publishingCredentials.name;
        this._setLeftSideText();
        this._updateDirectory();
      });
    });
  }

  ngOnDestroy() {
    if (this._lastAPICall && !this._lastAPICall.closed) {
      this._lastAPICall.unsubscribe();
    }
  }

  /**
   * Handle key pressed by the user
   * @param event key pressed by the user
   */
  handleKeyPress(event: KeyboardEvent) {
    event.preventDefault();
    if (!this._isKeyEventValid(event.which)) {
      return;
    }
    /**
     * Switch case on the key number
     */
    switch (event.which) {
      case KeyCodes.backspace: {
        this._backspaceKeyEvent();
        break;
      }
      case KeyCodes.tab: {
        this._tabKeyEvent();
        this._renderPromptVariables();
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
        this._appendToCommand(ConsoleConstants.whitespace);
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
   * Expand the console interface
   */
  expand() {
    this.isExpanded = true;
    this.expandClicked.emit(true);
  }

  /**
   * Compress the console interface
   */
  compress(preventEvent?: boolean) {
    this.isExpanded = false;
    if (!preventEvent) {
      this.expandClicked.emit(false);
    }
  }

  /**
   * Clear console on button press
   */
  clearConsole() {
    this._removeMsgComponents();
  }

  /**
   * Focus the console, when console is clicked.
   */
  focusConsole() {
    this.isFocused = true;
    this._renderPromptVariables();
  }

  /**
   * Copy last response to the clipboard
   */
  copyLogs(event) {
    if (this._msgComponents.length > 0) {
      this._utilities.copyContentToClipboard(this._msgComponents[this._msgComponents.length - 1].instance.message);
    }
  }

  /**
   * Get left side text for the console according to the app type
   */
  private _setLeftSideText() {
    this.leftSideText = this.isLinux ? this.appName + '@' + this._functionName + ':~$ ' : this.dir + '> ';
    if (this._currentPrompt) {
      this._currentPrompt.instance.dir = this.leftSideText;
    }
  }

  /**
   * Check if the key pressed by the user is valid
   * @param key key pressed by the user
   */
  private _isKeyEventValid(key: number) {
    if (key === KeyCodes.unknown) {
      // block all unknown key inputs
      return false;
    }
    if (this._enterPressed && key !== KeyCodes.ctrl && key !== KeyCodes.c) {
      // command already in progress
      return false;
    }
    return true;
  }

  /**
   * Left Arrow key pressed
   */
  private _leftArrowKeyEvent() {
    if (this._ptrPosition >= 1) {
      --this._ptrPosition;
      this._divideCommand();
    }
  }

  /**
   * Right Arrow key pressed
   */
  private _rightArrowKeyEvent() {
    if (this._ptrPosition < this.command.complete.length) {
      ++this._ptrPosition;
      this._divideCommand();
    }
  }

  /**
   * Down Arrow key pressed
   */
  private _downArrowKeyEvent() {
    if (this._commandHistory.length > 0 && this._commandHistoryIndex < this._commandHistory.length - 1) {
      this._commandHistoryIndex = (this._commandHistoryIndex + 1) % this._commandHistory.length;
      this.command.complete = this._commandHistory[this._commandHistoryIndex];
      this._ptrPosition = this.command.complete.length;
      this._divideCommand();
    }
  }

  /**
   * Top Arrow key pressed
   */
  private _topArrowKeyEvent() {
    if (this._commandHistoryIndex > 0) {
      this.command.complete = this._commandHistory[this._commandHistoryIndex - 1];
      this._commandHistoryIndex = this._commandHistoryIndex === 1 ? 0 : --this._commandHistoryIndex;
      this._ptrPosition = this.command.complete.length;
      this._divideCommand();
    }
  }

  /**
   * Backspace pressed by the user
   */
  private _backspaceKeyEvent() {
    if (this._ptrPosition < 1) {
      return;
    }
    this.command.left = this.command.left.slice(0, -1);
    if (this._ptrPosition === this.command.complete.length) {
      this.command.complete = this.command.left;
      --this._ptrPosition;
      return;
    }
    this.command.complete = this.command.left + this.command.mid + this.command.right;
    --this._ptrPosition;
    this._divideCommand();
  }

  /**
   * Handle the Enter key pressed operation
   */
  private _enterKeyEvent() {
    this._enterPressed = true;
    const flag = this._performAction();
    this._removePrompt();
    this._commandHistory.push(this.command.complete);
    this._commandHistoryIndex = this._commandHistory.length;
    if (flag) {
      this._addMessageComponent();
      this._connectToKudu();
    } else {
      this._addPromptComponent();
      this._enterPressed = false;
    }
    this._resetCommand();
  }

  /**
   * Remove the current prompt from the console
   */
  private _removePrompt() {
    const oldPrompt = document.getElementById('prompt');
    if (oldPrompt) {
      oldPrompt.parentNode.removeChild(oldPrompt);
    }
  }

  /**
   * Remove all the message history
   */
  private _removeMsgComponents() {
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
  private _addMessageComponent(message?: string) {
    if (!this._messageComponent) {
      this._messageComponent = this._componentFactoryResolver.resolveComponentFactory(MessageComponent);
    }
    const msgComponent = this._prompt.createComponent(this._messageComponent);
    msgComponent.instance.loading = message ? false : true;
    msgComponent.instance.message = message ? message : this.leftSideText + this.command.complete;
    this._msgComponents.push(msgComponent);
    this._updateConsoleScroll();
  }

  /**
   * Creates a new prompt box,
   * created everytime a command is entered by the user and
   * some response is generated from the server, or 'cls', 'exit'
   */
  private _addPromptComponent() {
    if (!this._promptComponent) {
      this._promptComponent = this._componentFactoryResolver.resolveComponentFactory(PromptComponent);
    }
    this._currentPrompt = this._prompt.createComponent(this._promptComponent);
    this._currentPrompt.instance.dir = this.leftSideText;
    this._currentPrompt.instance.isLinux = this.isLinux;
    this._currentPrompt.instance.isFocused = true;
    // hide the loader on the last 2 msg-components
    if (this._msgComponents.length > 0) {
      // check required if 'clear' command is entered.
      this._msgComponents[this._msgComponents.length - 1].instance.loading = false;
    }
    if (this._msgComponents.length > 1) {
      this._msgComponents[this._msgComponents.length - 2].instance.loading = false;
    }
    this._enterPressed = false;
    this._updateConsoleScroll();
  }

  /**
   * Update Scroll status of the console
   */
  private _updateConsoleScroll() {
    window.setTimeout(() => {
      const el = document.getElementById('console-body');
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }

  /**
   * Create a error message
   * @param error : String, represents the error message to be shown
   */
  private _addErrorComponent(error: string) {
    if (!this._errorComponent) {
      this._errorComponent = this._componentFactoryResolver.resolveComponentFactory(ErrorComponent);
    }
    const errorComponent = this._prompt.createComponent(this._errorComponent);
    this._msgComponents.push(errorComponent);
    errorComponent.instance.message = error;
  }

  /**
   * Refresh the tab elements,
   * i.e. the list of files/folder and the current dir index
   */
  private _refreshTabFunctionElements() {
    this._listOfDir.length = 0;
    this._dirIndex = -1;
  }

  /**
   * Reset the command
   */
  private _resetCommand() {
    this.command.complete = '';
    this.command.right = '';
    this.command.left = '';
    this.command.mid = ConsoleConstants.whitespace;
    this._ptrPosition = 0;
  }

  /**
   * Force quite a currently running command (Ctrl + C pressed)
   */
  private _forceQuit() {
    if (!this._lastAPICall || this._lastAPICall.closed) {
      this._removePrompt();
      this._addMessageComponent();
    } else if (!this._lastAPICall.closed) {
      this._lastAPICall.unsubscribe();
    }
    this._resetCommand();
    this._addPromptComponent();
  }

  /**
   * Add the text to the current command
   * @param cmd :String
   */
  private _appendToCommand(cmd: string, key?: number) {
    if (
      key &&
      ((key > KeyCodes.backspace && key <= KeyCodes.delete) ||
        (key >= KeyCodes.leftWindow && key <= KeyCodes.select) ||
        (key >= KeyCodes.f1 && key < KeyCodes.scrollLock))
    ) {
      // key-strokes not allowed, for e.g F1-F12
      return;
    }
    if (key && this._lastKeyPressed === KeyCodes.ctrl) {
      // Ctrl + C or Ctrl + V pressed, should not append c/v to the current command
      if (key === KeyCodes.c) {
        this._forceQuit();
        return;
      }
      if (key === KeyCodes.v) {
        return;
      }
    }
    this._commandHistoryIndex = this._commandHistory.length; // reset the command-index to the last command
    if (this._ptrPosition === this.command.complete.length) {
      this.command.left += cmd;
      this.command.complete = this.command.left;
      ++this._ptrPosition;
      return;
    }
    this.command.left += cmd;
    this.command.complete = this.command.left + this.command.mid + this.command.right;
    ++this._ptrPosition;
  }

  /**
   * Render the dynamically loaded prompt box,
   * i.e. pass in the updated command the inFocus value to the PromptComponent.
   */
  private _renderPromptVariables() {
    if (this._currentPrompt) {
      this._currentPrompt.instance.command = this.command;
      this._currentPrompt.instance.isFocused = this.isFocused;
    }
  }

  /**
   * Divide command into different parts
   */
  private _divideCommand() {
    if (this._ptrPosition < 0 || this._ptrPosition > this.command.complete.length) {
      return;
    }
    if (this._ptrPosition === this.command.complete.length) {
      this.command.left = this.command.complete;
      this.command.mid = ConsoleConstants.whitespace;
      this.command.right = '';
      return;
    }
    this.command.left = this.command.complete.substring(0, this._ptrPosition);
    this.command.mid = this.command.complete.substring(this._ptrPosition, this._ptrPosition + 1);
    this.command.right = this.command.complete.substring(this._ptrPosition + 1, this.command.complete.length);
  }

  /**
   * Create a command based on the app-type
   * @param cmd command entered by the user
   */
  private _createCommand(cmd: string) {
    if (this.isLinux) {
      return `bash -c ' ${cmd} && echo '' && pwd'`;
    }
    return `${cmd} & echo. & cd`;
  }

  /**
   * Handle the tab-pressed event
   */
  private _tabKeyEvent() {
    if (this._listOfDir.length === 0) {
      this._dirIndex = -1;
      const res = this._getKuduApiResponse(HttpMethods.POST, {
        command: this._createCommand(this._getTabKeyCommand()),
        dir: this.dir,
      });
      res.subscribe(
        data => {
          const { Output, ExitCode } = data.json();
          if (ExitCode === ConsoleConstants.successExitcode) {
            // fetch the list of files/folders in the current directory
            const cmd = this.command.complete.substring(0, this._ptrPosition);
            const allFiles = this.isLinux
              ? Output.split(ConsoleConstants.linuxNewLine + this.dir)[0].split(ConsoleConstants.newLine)
              : Output.split(ConsoleConstants.windowsNewLine + this.dir)[0].split(ConsoleConstants.newLine);
            this._tabKeyPointer = cmd.lastIndexOf(ConsoleConstants.whitespace);
            this._listOfDir = this._consoleService.findMatchingStrings(allFiles, cmd.substring(this._tabKeyPointer + 1));
            if (this._listOfDir.length > 0) {
              this.command.complete = cmd;
              this._replaceWithFileName();
            }
          }
        },
        err => {
          console.log('Tab Key Error' + err.text);
        }
      );
    } else {
      this._replaceWithFileName();
    }
  }

  /**
   * Change the command on tab key event
   */
  private _setCommandOnTabEventEvent() {
    this._dirIndex = (this._dirIndex + 1) % this._listOfDir.length;
    this.command.complete = this.command.complete.substring(0, this._tabKeyPointer + 1);
    this.command.complete += this._listOfDir[this._dirIndex].trim();
  }

  /**
   * Replace a part of the command with the file-name in the current directory
   */
  private _replaceWithFileName() {
    this._setCommandOnTabEventEvent();
    this._ptrPosition = this.command.complete.length;
    this._divideCommand();
  }

  /**
   * Get tab key(i.e get contents of current directory) according to the app-type
   */
  private _getTabKeyCommand() {
    if (this.isLinux) {
      return 'ls -a';
    }
    return 'dir /b /a';
  }

  /**
   * Connect to the kudu API and display the response;
   * both incase of an error or a valid response
   */
  private _connectToKudu() {
    const cmd = this.command.complete;
    const res = this._getKuduApiResponse(HttpMethods.POST, {
      command: this._createCommand(cmd),
      dir: this.dir,
    });
    this._lastAPICall = res.subscribe(
      data => {
        const { Output, ExitCode, Error } = data.json();
        if (Error !== '') {
          this._addErrorComponent(`${Error.trim()}${this._getNewLine()}`);
        } else if (ExitCode === ConsoleConstants.successExitcode && Output !== '') {
          this._updateDirectoryAfterCommand(Output.trim());
          const msg = Output.split(this._getMessageDelimeter())[0].trim();
          this._addMessageComponent(`${msg}${this._getNewLine()}`);
        }
        this._addPromptComponent();
        this._enterPressed = false;
      },
      err => {
        this._addErrorComponent(err.text);
        this._enterPressed = false;
      }
    );
  }

  /**
   * Get new line character according to the console type
   */
  private _getNewLine(): string {
    if (this.isLinux) {
      return ConsoleConstants.linuxNewLine;
    }
    return ConsoleConstants.windowsNewLine.repeat(2);
  }

  /**
   * Get the delimeter according to the app type
   */
  private _getMessageDelimeter(): string {
    if (this.isLinux) {
      return `${ConsoleConstants.linuxNewLine}${this.dir}`;
    }
    return `${ConsoleConstants.windowsNewLine}${this.dir}`;
  }

  /**
   * Check and update the directory
   * @param cmd string which represents the response from the API
   */
  private _updateDirectoryAfterCommand(cmd: string) {
    if (this.isLinux) {
      const result = cmd.split(ConsoleConstants.linuxNewLine);
      this.dir = result[result.length - 1];
    } else {
      const result = cmd.split(ConsoleConstants.windowsNewLine);
      this.dir = result[result.length - 1];
    }
    this._setLeftSideText();
  }

  /**
   * perform action on key pressed.
   */
  private _performAction(): boolean {
    if (
      this.command.complete.toLowerCase() === ConsoleConstants.windowsClear ||
      this.command.complete.toLowerCase() === ConsoleConstants.linuxClear
    ) {
      this._removeMsgComponents();
      return false;
    }
    if (this.command.complete.toLowerCase() === ConsoleConstants.exit) {
      this._removeMsgComponents();
      this._setConsoleDetails(this.isLinux);
      return false;
    }
    return true;
  }

  /**
   * Get API Url according to the app type
   */
  private _getKuduUri() {
    const scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === HostType.Repository).name;
    if (this.isLinux) {
      return `https://${scmHostName}/command`;
    }
    return `https://${scmHostName}/api/command`;
  }

  /**
   * Get headers for the api call
   */
  private _getHeader(): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append(
      'Authorization',
      `Basic ` +
        (this._publishingCredentials
          ? btoa(
              `${this._publishingCredentials.properties.publishingUserName}:${this._publishingCredentials.properties.publishingPassword}`
            )
          : btoa(`admin:kudu`))
    );
    return headers;
  }

  /**
   * Get KUDU Response
   * @param method HttpMethod for the request
   * @param body body of the request
   */
  private _getKuduApiResponse(method: string, body?: any) {
    const uri = this._getKuduUri();
    const header = this._getHeader();
    return this._consoleService.send(method, uri, body ? JSON.stringify(body) : null, header);
  }

  /**
   * Set console details.
   * @param isLinux boolean which represents whether the app is a linux app.
   */
  private _setConsoleDetails(isLinux: boolean) {
    this.isLinux = isLinux;
    this._updateDirectory();
    this._setLeftSideText();
  }

  /**
   * Set Default Directory
   */
  private _updateDirectory() {
    if (!this._site || !this._publishingCredentials) {
      return;
    }
    if (this.isLinux) {
      this.dir = `/home/site/wwwroot/${this._functionName}`;
      return;
    }
    const res = this._getKuduApiResponse(HttpMethods.POST, {
      command: 'cd',
      dir: 'site\\wwwroot',
    });
    res.subscribe(data => {
      const { Output } = data.json();
      this.dir = Output.trim() + ConsoleConstants.singleBackslash + this._functionName;
      this._setLeftSideText();
    });
  }
}
