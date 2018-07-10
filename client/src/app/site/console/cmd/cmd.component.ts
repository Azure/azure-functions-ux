import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentFactory, ComponentRef, Input, ElementRef, Injector} from '@angular/core';
import { SiteTabIds, LogCategories, KeyCodes } from '../../../shared/models/constants';
import { PromptComponent } from './../templates/prompt.component';
import { MessageComponent } from './../templates/message.component';
import { ErrorComponent } from './../templates/error.component';
import { SiteService } from '../../../shared/services/site.service';
import { LogService } from '../../../shared/services/log.service';
import { CacheService } from '../../../shared/services/cache.service';
import { TreeViewInfo, SiteData } from '../../../tree-view/models/tree-view-info';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { ArmObj } from '../../../shared/models/arm/arm-obj';
import { Site } from '../../../shared/models/arm/site';
import { PublishingCredentials } from '../../../shared/models/publishing-credentials';
import { Headers } from '@angular/http';
import { ConsoleService } from './../services/console.service';
import { FeatureComponent } from '../../../shared/components/feature-component';

@Component({
  selector: 'app-cmd',
  templateUrl: './cmd.component.html',
  styleUrls: ['./../console.component.scss'],
  providers: [
    ConsoleService
  ]
})
export class CmdConsoleComponent extends FeatureComponent<TreeViewInfo<SiteData>> implements OnInit {
  public resourceId: string;
  public viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
  public consoleIcon = 'image/console.svg';
  public isFocused = false;
  public commandInParts = {leftCmd: '', middleCmd: ' ' , rightCmd: ''}; // commands to left, right and on the pointer
  public dir = 'D:\\home\\site\\wwwroot';
  public initialized = false;
  private _site: ArmObj<Site>;
  private _pubCred: ArmObj<PublishingCredentials>;
  private _lastAPICall: Subscription = undefined;
  /*** Variables for Tab-key ***/
  private _listOfDir: string[] = [];
  private _dirIndex = -1;
  /*** Variables for Command + Dir @Input ***/
  private _lastKeyPressed = -1;
  private _command = '';
  private _ptrPosition = 0;
  private _promptComponent: ComponentFactory<any>;
  private _messageComponent: ComponentFactory<any>;
  private _errorComponent: ComponentFactory<any>;
  private _msgComponents: ComponentRef<any>[] = [];
  private _currentPrompt: ComponentRef<any> = null;
  private _commandHistory: string[] = [''];
  private _commandHistoryIndex = 1;
  @Input() set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this.setInput(viewInfo);
  }
  /**
   * UI Elements
   */
  @ViewChild('prompt', {read: ViewContainerRef})
  private prompt: ViewContainerRef;
  @ViewChild('consoleText')
  private _consoleText: ElementRef;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _siteService: SiteService,
    private _logService: LogService,
    private _cacheService: CacheService,
    private _consoleService: ConsoleService,
    injector: Injector,
    ) {
      super('site-console', injector, SiteTabIds.winConsole);
      this.featureName = 'console';
      this.isParentComponent = true;
    }

  protected setup(inputEvents: Observable<TreeViewInfo<SiteData>>) {
     // ARM API request to get the site details and the publishing credentials
    return inputEvents
      .distinctUntilChanged()
      .switchMap(view => {
        this.setBusy();
        this.resourceId = view.resourceId;
        return Observable.zip(
          this._siteService.getSite(this.resourceId),
          this._cacheService.postArm(`${this.resourceId}/config/publishingcredentials/list`),
          (site, pubCred) => ({
            site: site.result,
            pubCred: pubCred.json()
          })
        );
      })
      .do(
        r => {
          this._site = r.site;
          this._pubCred = r.pubCred;
          this.clearBusyEarly();
        },
        err => {
          this._logService.error(LogCategories.cicd, '/load-console', err);
          this.clearBusyEarly();
        });
  }

  ngOnInit(): void {
    this.initialized = true;
    this.focusConsole();
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
    this._command += text;
    this._ptrPosition = this._command.length;
    this._divideCommandForPtr();
  }

  /**
   * Handle the copy event when in focus
   * @param event: Keyevent (copy in particular)
   */
  handleCopy(event) {
    if (!this._lastAPICall) {
      this._removePrompt();
      this._addMessageComponent();
    } else if (!this._lastAPICall.closed) {
      this._lastAPICall.unsubscribe();
    }
    this._resetCommand();
    this._addPromptComponent();
  }

  /**
   * Handle the right mouse click
   * @param event: MouseEvent, particularly right-click
   */
  handleRightMouseClick(event): boolean {
    return false;
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
        this._tabKeyEvent();
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
   * Delete the prompt-box.
   */
  private _removePrompt() {
    const oldPrompt = document.getElementById('prompt');
    if (!oldPrompt) {
      return;
    }
    oldPrompt.remove();
  }

  /**
   * Left Arrow key pressed
   */
  private _leftArrowKeyEvent() {
    if (this._ptrPosition >= 1) {
      --this._ptrPosition;
      this._divideCommandForPtr();
    }
  }

  /**
   * Right Arrow key pressed
   */
  private _rightArrowKeyEvent() {
    if (this._ptrPosition < this._command.length) {
      ++this._ptrPosition;
      this._divideCommandForPtr();
    }
  }

  /**
   * Down Arrow key pressed
   */
  private _downArrowKeyEvent() {
    if (this._commandHistory.length > 0 && this._commandHistoryIndex < this._commandHistory.length - 1) {
      this._commandHistoryIndex = (this._commandHistoryIndex + 1) % (this._commandHistory.length);
      this._command = this._commandHistory[this._commandHistoryIndex];
      this._ptrPosition = this._command.length;
      this._divideCommandForPtr();
    }
  }

  /**
   * Top Arrow key pressed
   */
  private _topArrowKeyEvent() {
    if (this._commandHistoryIndex > 0) {
      this._command = this._commandHistory[this._commandHistoryIndex - 1];
      this._commandHistoryIndex = (this._commandHistoryIndex === 1 ? 0 : --this._commandHistoryIndex);
      this._ptrPosition = this._command.length;
      this._divideCommandForPtr();
    }
  }

  /**
   * Handle the tab-pressed event
   */
  private _tabKeyEvent() {
    this.focusConsole();
    if (this._listOfDir.length === 0) {
      const uri = this._getKuduUri();
      const header = this._getHeader();
      const body = {'command': 'dir /b /a', 'dir': this.dir + '\\'}; // can use ls -a also
      const res = this._consoleService.send('POST', uri, JSON.stringify(body), header);
      res.subscribe(
        data => {
          const output = data.json();
          if (output.ExitCode === 1) {
            // unable to fetch the list of files/folders in the current directory
          } else {
            const cmd = this._command.substring(0, this._ptrPosition);
            const allFiles = output.Output.split('\r\n');
            this._listOfDir = this._consoleService.findMatchingStrings(allFiles, cmd.substring(cmd.lastIndexOf(' ') + 1));
            if (this._listOfDir.length === 0) {
              return;
            }
            this._dirIndex = 0;
            this._command = this._command.substring(0, this._ptrPosition);
            this._command = this._command.substring(0, this._command.lastIndexOf(' ') + 1) + this._listOfDir[0];
            this._ptrPosition = this._command.length;
            this._divideCommandForPtr();
          }
          // console.log(output);
        },
        err => {
          // console.log('Tab Error: ' + err);
        }
      );
      return;
    }
    this._command = this._command.substring(0, this._ptrPosition);
    this._command = this._command.substring(0, this._command.lastIndexOf(' ') + 1) + this._listOfDir[ (++this._dirIndex) % this._listOfDir.length];
    this._ptrPosition = this._command.length;
    this._divideCommandForPtr();
  }

  /**
   * Backspace pressed by the user
   */
  private _backspaceKeyEvent() {
    if (this._ptrPosition < 1) {
      return;
    }
    this.commandInParts.leftCmd = this.commandInParts.leftCmd.slice(0, -1);
    if (this._ptrPosition === this._command.length) {
      this._command = this.commandInParts.leftCmd;
      --this._ptrPosition;
      return;
    }
    this._command = this.commandInParts.leftCmd + this.commandInParts.middleCmd + this.commandInParts.rightCmd;
    --this._ptrPosition;
    this._divideCommandForPtr();
  }

  /**
   * Handle the Enter key pressed operation
   */
  private _enterKeyEvent() {
    const flag = this._performAction();
    this._removePrompt();
    this._commandHistory.push(this._command);
    this._commandHistoryIndex = this._commandHistory.length;
    if (flag) {
      this._addMessageComponent();
      this._connectToKudu();
    } else {
      this._addPromptComponent();
    }
    this._resetCommand();
  }

  /**
   * Get Kudu API URL
   */
  private _getKuduUri(): string {
    const scmHostName = this._site ? (this._site.properties.hostNameSslStates.find (h => h.hostType === 1).name) : 'funcplaceholder01.scm.azurewebsites.net';
    return `https://${scmHostName}/api/command`;
  }

  /**
   * Get the header to connect to the KUDU API.
   */
  private _getHeader(): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Authorization', `Basic ` + ((this._pubCred) ? btoa(`${this._pubCred.properties.publishingUserName}:${this._pubCred.properties.publishingPassword}`) : btoa(`admin:kudu`)));
    return headers;
  }

  /**
   * Connect to the kudu API and display the response;
   * both incase of an error or a valid response
   */
  private _connectToKudu() {
    const uri = this._getKuduUri();
    const header = this._getHeader();
    const cmd = this._command;
    const body = {'command': cmd, 'dir': (this.dir + '\\') };
    const res = this._consoleService.send('POST', uri, JSON.stringify(body), header);
    this._lastAPICall = res.subscribe(
      data => {
        const output = data.json();
        if (output.ExitCode === 1 && output.Output === '') {
          this._addErrorComponent(output.Error + '\r\n');
          this._addPromptComponent();
        } else {
          this._addMessageComponent(output.Output + '\r\n');
          if (output.ExitCode === 0 && output.Output === '') {
            this._performAction(cmd);
          }
          this._addPromptComponent();
        }
        return output;
      },
      err => {
        this._addErrorComponent(err.text);
      }
    );
  }

  /**
   * perform action on key pressed.
   */
  private _performAction(cmd?: string): boolean {
    if (this._command.toLowerCase() === 'cls') {
      this._removeMsgComponents();
      return false;
    }
    if (this._command.toLowerCase() === 'exit') {
      this._removeMsgComponents();
      this.dir = 'D:\\home\\site\\wwwroot';
      return false;
    }
    if (cmd && cmd.toLowerCase().startsWith('cd')) {
      cmd = cmd.substring(2).trim().replace(/\//g, '\\').replace(/\\\\/g, '\\');
      const currentDirs = this.dir.split('\\');
      if (cmd === '\\') {
        this.dir = currentDirs[0];
      } else {
        const dirsInPath = cmd.split('\\');
        for (let i = 0; i < dirsInPath.length; ++i) {
          if (dirsInPath[i] === '.') {
            // remain in current directory
          } else if (dirsInPath[i] === '' || dirsInPath[i] === '..') {
            if (currentDirs.length === 1) {
              break;
            }
            currentDirs.pop();
          } else {
            currentDirs.push(dirsInPath[i]);
          }
        }
        this.dir = currentDirs.join('\\');
      }
      return false;
    }
    return true;
  }

  /**
   * Divide the commands into left, current and right
   */
  private _divideCommandForPtr() {
    if (this._ptrPosition < 0 || this._ptrPosition > this._command.length) {
      return;
    }
    if (this._ptrPosition === this._command.length) {
      this.commandInParts.leftCmd = this._command;
      this.commandInParts.middleCmd = ' ';
      this.commandInParts.rightCmd = '';
      return;
    }
    this.commandInParts.leftCmd = this._command.substring(0, this._ptrPosition);
    this.commandInParts.middleCmd = this._command.substring(this._ptrPosition, this._ptrPosition + 1);
    this.commandInParts.rightCmd = this._command.substring(this._ptrPosition + 1, this._command.length);
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
    this._command = '';
    this.commandInParts.rightCmd = '';
    this.commandInParts.leftCmd = '';
    this.commandInParts.middleCmd = ' ';
    this._ptrPosition = 0;
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
    this._commandHistoryIndex = this._commandHistory.length; // reset the command-index to the last command
    if (this._ptrPosition === this._command.length) {
      this.commandInParts.leftCmd += cmd;
      this._command = this.commandInParts.leftCmd;
      ++this._ptrPosition;
      return;
    }
    this.commandInParts.leftCmd += cmd;
    this._command = this.commandInParts.leftCmd + this.commandInParts.middleCmd + this.commandInParts.rightCmd;
    ++this._ptrPosition;
  }

  /**
   * Render the dynamically loaded prompt box,
   * i.e. pass in the updated command the inFocus value to the PromptComponent.
   */
  private _renderPromptVariables() {
    if (this._currentPrompt) {
      this._currentPrompt.instance.command = this._command;
      this._currentPrompt.instance.commandInParts = this.commandInParts;
      this._currentPrompt.instance.isFocused = this.isFocused;
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
    const msgComponent = this.prompt.createComponent(this._messageComponent);
    msgComponent.instance.message = (message ? message : (this.dir + '>' + this._command));
    this._msgComponents.push(msgComponent);
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
    this._currentPrompt = this.prompt.createComponent(this._promptComponent);
    this._currentPrompt.instance.dir = this.dir + '>';
  }

  /**
   * Create a error message
   * @param error : String, represents the error message to be shown
   */
  private _addErrorComponent(error: string) {
    if (!this._errorComponent) {
      this._errorComponent = this._componentFactoryResolver.resolveComponentFactory(ErrorComponent);
    }
    const errorComponent = this.prompt.createComponent(this._errorComponent);
    this._msgComponents.push(errorComponent);
    errorComponent.instance.message = error;
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
}
