import {
  OnInit,
  OnDestroy,
  ComponentFactoryResolver,
  ComponentFactory,
  ComponentRef,
  ViewChild,
  ViewContainerRef,
  ElementRef,
  Input,
} from '@angular/core';
import { ArmObj } from '../../../../shared/models/arm/arm-obj';
import { Site } from '../../../../shared/models/arm/site';
import { PublishingCredentials } from '../../../../shared/models/publishing-credentials';
import { Subscription } from 'rxjs/Subscription';
import { ConsoleService } from './../services/console.service';
import { KeyCodes, ConsoleConstants } from '../../../../shared/models/constants';
import { ErrorComponent } from './error.component';
import { MessageComponent } from './message.component';
import { PromptComponent } from './prompt.component';
import { Headers } from '@angular/http';

export abstract class AbstractConsoleComponent implements OnInit, OnDestroy {
  public resourceId: string;
  public consoleType: number;
  public isFocused = false;
  public commandInParts = { leftCmd: '', middleCmd: ' ', rightCmd: '' }; // commands to left, right and on the pointer
  public dir: string;
  public initialized = false;
  protected enterPressed = false;
  protected site: ArmObj<Site>;
  protected publishingCredentials: ArmObj<PublishingCredentials>;
  protected siteSubscription: Subscription;
  protected publishingCredSubscription: Subscription;

  /*** Variables for Tab-key ***/
  protected listOfDir: string[] = [];
  protected dirIndex = -1;
  protected lastAPICall: Subscription = undefined;
  protected tabKeyPointer: number;
  /*** Variables for Command + Dir @Input ***/
  protected command = '';
  protected ptrPosition = 0;
  protected commandHistory: string[] = [''];
  protected commandHistoryIndex = 1;
  protected currentPrompt: ComponentRef<any> = null;
  private _lastKeyPressed = -1;
  private _promptComponent: ComponentFactory<any>;
  private _messageComponent: ComponentFactory<any>;
  private _errorComponent: ComponentFactory<any>;
  private _msgComponents: ComponentRef<any>[] = [];
  private _resourceIdSubscription: Subscription;

  @Input()
  public appName: string;
  /**
   * UI Elements
   */
  @ViewChild('prompt', { read: ViewContainerRef })
  private _prompt: ViewContainerRef;
  @ViewChild('consoleText')
  private _consoleText: ElementRef;

  constructor(private _componentFactoryResolver: ComponentFactoryResolver, private _consoleService: ConsoleService) {}

  ngOnInit() {
    this._resourceIdSubscription = this._consoleService.getResourceId().subscribe(resourceId => {
      this.resourceId = resourceId;
    });
    this.initializeConsole();
    this.initialized = true;
    this.focusConsole();
  }

  ngOnDestroy() {
    this._resourceIdSubscription.unsubscribe();
    this.siteSubscription.unsubscribe();
    this.publishingCredSubscription.unsubscribe();

    if (this.lastAPICall && !this.lastAPICall.closed) {
      this.lastAPICall.unsubscribe();
    }
  }

  /**
   * Intialize console specific variables like dir
   */
  protected abstract initializeConsole();

  /**
   * Mouse Press outside the console,
   * i.e. the console no longer in focus
   */
  unFocusConsole() {
    this.isFocused = false;
    this._renderPromptVariables();
  }

  /**
   * Unfocus console manually
   */
  unFocusConsoleManually() {
    this._consoleText.nativeElement.blur();
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
    if (!this.lastAPICall || this.lastAPICall.closed) {
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
   * Get the delimeter according to the app type
   */
  protected abstract getMessageDelimeter(): string;

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
  protected abstract getKuduUri(): string;

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
    headers.append(
      'Authorization',
      `Basic ` +
        (this.publishingCredentials
          ? btoa(`${this.publishingCredentials.properties.publishingUserName}:${this.publishingCredentials.properties.publishingPassword}`)
          : btoa(`admin:kudu`))
    );
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
    msgComponent.instance.loading = message ? false : true;
    msgComponent.instance.message = message ? message : this.getConsoleLeft() + this.command;
    this._msgComponents.push(msgComponent);
    this._updateConsoleScroll();
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
    this.currentPrompt = this._prompt.createComponent(this._promptComponent);
    this.currentPrompt.instance.dir = this.getConsoleLeft();
    this.currentPrompt.instance.consoleType = this.consoleType;
    // hide the loader on the last 2 msg-components
    if (this._msgComponents.length > 0) {
      // check required if 'clear' command is entered.
      this._msgComponents[this._msgComponents.length - 1].instance.loading = false;
    }
    if (this._msgComponents.length > 1) {
      this._msgComponents[this._msgComponents.length - 2].instance.loading = false;
    }
    this._updateConsoleScroll();
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
    this._updateConsoleScroll();
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
      this.commandInParts.middleCmd = ConsoleConstants.whitespace;
      this.commandInParts.rightCmd = '';
      return;
    }
    this.commandInParts.leftCmd = this.command.substring(0, this.ptrPosition);
    this.commandInParts.middleCmd = this.command.substring(this.ptrPosition, this.ptrPosition + 1);
    this.commandInParts.rightCmd = this.command.substring(this.ptrPosition + 1, this.command.length);
  }

  /**
   * Change the command on tab-key event
   */
  protected setCommandOnTabKeyEvent() {
    this.dirIndex = (this.dirIndex + 1) % this.listOfDir.length;
    this.command = this.command.substring(0, this.tabKeyPointer + 1);
    this.command += this.listOfDir[this.dirIndex].trim();
  }

  /**
   * Replace a part of the command with the file-name in the current directory
   */
  protected replaceWithFileName() {
    this.setCommandOnTabKeyEvent();
    this.ptrPosition = this.command.length;
    this.divideCommandForPtr();
  }

  /**
   * Scroll to the latest test in the console
   */
  private _updateConsoleScroll() {
    window.setTimeout(() => {
      const el = document.getElementById('console-body');
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    });
  }

  private _isKeyEventValid(key: number) {
    if (key === KeyCodes.unknown) {
      // block all unknown key inputs
      return false;
    }
    if (this.enterPressed && key !== KeyCodes.ctrl && key !== KeyCodes.c) {
      // command already in progress
      return false;
    }
    return true;
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
      this.commandHistoryIndex = (this.commandHistoryIndex + 1) % this.commandHistory.length;
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
      this.commandHistoryIndex = this.commandHistoryIndex === 1 ? 0 : --this.commandHistoryIndex;
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
    this.enterPressed = true;
    const flag = this.performAction();
    this._removePrompt();
    this.commandHistory.push(this.command);
    this.commandHistoryIndex = this.commandHistory.length;
    if (flag) {
      this.addMessageComponent();
      this.connectToKudu();
    } else {
      this.addPromptComponent();
      this.enterPressed = false;
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
    this.commandInParts.middleCmd = ConsoleConstants.whitespace;
    this.ptrPosition = 0;
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
    if (this.currentPrompt) {
      this.currentPrompt.instance.command = this.command;
      this.currentPrompt.instance.commandInParts = this.commandInParts;
      this.currentPrompt.instance.isFocused = this.isFocused;
    }
  }
}
