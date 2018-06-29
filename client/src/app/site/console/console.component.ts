import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ComponentFactory, AfterContentInit, ComponentRef, Input, ElementRef} from '@angular/core';
import { BroadcastService } from '../../shared/services/broadcast.service';
import { SiteTabIds, LogCategories } from '../../shared/models/constants';
import { BusyStateScopeManager } from 'app/busy-state/busy-state-scope-manager';
import { PromptComponent } from './templates/prompt.component';
import { MessageComponent } from './templates/message.component';
import { ErrorComponent } from './templates/error.component';
import { SiteService } from '../../shared/services/site.service';
import { LogService } from '../../shared/services/log.service';
import { CacheService } from '../../shared/services/cache.service';
import { TreeViewInfo, SiteData } from '../../tree-view/models/tree-view-info';
import { Subject, Observable, Subscription } from 'rxjs';
import { ArmObj } from '../../shared/models/arm/arm-obj';
import { Site } from '../../shared/models/arm/site';
import { PublishingCredentials } from '../../shared/models/publishing-credentials';
import { Headers } from '@angular/http';
import { ConsoleService } from './services/console.service';
//import { KuduConsoleModel } from './kudu.console.model';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss'],
  providers: [
    ConsoleService
  ]
})
export class ConsoleComponent implements OnInit, AfterContentInit {
  
  public resourceId: string;
  public viewInfoStream = new Subject<TreeViewInfo<SiteData>>();
  public viewInfo: TreeViewInfo<SiteData>;
  public consoleIcon = 'image/console.svg';
  public isFocused: boolean = false;
  public commandInParts = {lCmd: "", mCmd: " " , rCmd: ""};
  public dir: string = "D:\\home\\site\\wwwroot";
  private initialized: boolean = false;
  
  private _site: ArmObj<Site>;
  private _pubCred: ArmObj<PublishingCredentials>;
  private _busyManager: BusyStateScopeManager;
  
  private _ongoingSub: Subscription = undefined;

  @Input()
  set viewInfoInput(viewInfo: TreeViewInfo<SiteData>) {
    this.viewInfo = viewInfo;
    this.viewInfoStream.next(viewInfo);
  }

  /**
   * Variables for Tab-key
   */
  private _ltOfDir : string[] = [];
  private _dirIndex = -1;

  /**
   * Variables for Command + Dir @Input
   */
  private _lastKeyPressed: number = -1;
  private _command: string = "";
  private _ptrPosition: number = 0;
  private _promptComponent: ComponentFactory<any>;
  private _messageComponent: ComponentFactory<any>;
  private _errorComponent: ComponentFactory<any>;
  private _msgComponents: ComponentRef<any>[] = [];
  private _currentPrompt: ComponentRef<any> = null;
  private _commandHistory: string[] = [''];
  private _vCommandNumber: number = 1;

  /**
   * UI Elements
   */
  @ViewChild('prompt', {read: ViewContainerRef})
  private prompt: ViewContainerRef;
  @ViewChild('consoleText')
  private _consoleText: ElementRef;

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _broadcastService: BroadcastService, 
    private _siteService: SiteService,
    private _logService: LogService,
    private _cacheService: CacheService,
    private _consoleService: ConsoleService,
    ) {
      this._busyManager = new BusyStateScopeManager(this._broadcastService, SiteTabIds.console);  
      //ARM API request to get the site details and the publishing credentials
      this.viewInfoStream
      .switchMap(view => {
        this._busyManager.setBusy();
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
      .subscribe(
        r => {
          this._site = r.site;
          this._pubCred = r.pubCred;
          this._busyManager.clearBusy();
        },
        err => {
          this._logService.error(LogCategories.cicd, '/load-console', err);
          this._busyManager.clearBusy();
        });
    }
  
  ngOnInit(): void {
    this. initialized = true;
    this.focusConsole();
  }

  ngAfterContentInit(){

  }

  /**
   * Mouse Press outside the console, 
   * i.e. the console no longer in focus
   */
  unFocusConsole(){
    this.isFocused = false;
    this.renderPromptVariables();
  }

  /**
   * Console brought to focus when textarea comes into focus
   */
  focusConsoleOnTabPress(){
    this.isFocused = true;
    this.renderPromptVariables();
  }

  /**
   * Mouse press inside the console, i.e. console comes into focus. 
   * If already in focus, the console remains to be in focus.
   */
  focusConsole(){
    this.isFocused = true;
    this.renderPromptVariables();
    this._consoleText.nativeElement.focus();
  }

  /**
   * Delete the prompt-box.
   */
  private removePrompt(){
    const oldPrompt = document.getElementById("prompt");
    if(!oldPrompt){
      return;
    }
    oldPrompt.remove();
  }

  /**
   * Handle the paste event when in focus
   * @param event: KeyEvent (paste in particular)
   */
  handlePaste(event){
    const text = event.clipboardData.getData('text/plain');
    this._command += text;
    this._ptrPosition = this._command.length;
    this.divideCommandForPtr();
  }

  /**
   * Handle the copy event when in focus
   * @param event: Keyevent (copy in particular)
   */
  handleCopy(event){
    if(!this._ongoingSub){
      this.removePrompt();
      this.addMessageComponent();
    }else if(!this._ongoingSub.closed){
      this._ongoingSub.unsubscribe();
    }   
    this.resetCommand();
    this.addPromptComponent();
  }

  /**
   * Handle the right mouse click
   * @param event: MouseEvent, particularly right-click
   */
  handleRightMouseClick(event){
    return false;
  }

  /**
   * Handles the key event of the keyboard, 
   * is called only when the console is in focus.
   * @param event: KeyEvent
   */
  keyEvent(event){
    console.log(event.which);
    /**
     * Switch case on the key number
     */
    switch(event.which){
      
      case 8 : { //backspace-pressed
        if(this._ptrPosition >= 1){
          this.backspaceKeyEvent();
        }
        break;
      }
      case 9 : {  //tab-pressed
        event.preventDefault();
        this.focusConsole();
        this.tabKeyEvent();
        return;
      }
      case 13: { //enter-pressed
        this.enterKeyEvent();
        break;
      }
      
      case 27 : { //ESC pressed
        this.resetCommand();  
        break;
      }

      case 32 : { //space-pressed
        this.appendToCommand(" ");
        break;
      }
      
      case 37 : { //left-arrow-pressed
        if(this._ptrPosition >= 1){
          --this._ptrPosition;
          this.divideCommandForPtr();
        }
        break;
      }

      case 38 : { //top-arrow pressed
        if(this._vCommandNumber > 0){
          this._command = this._commandHistory[this._vCommandNumber - 1];
          this._vCommandNumber = (this._vCommandNumber == 1 ? 0 : --this._vCommandNumber);
          this._ptrPosition = this._command.length;
          this.divideCommandForPtr();
        }
        break;
      }

      case 39 : { //right-arrow-pressed
        if(this._ptrPosition < this._command.length){
          ++this._ptrPosition;
          this.divideCommandForPtr();
        }
        break;
      }

      case 40 : { //down-arrow pressed
        if(this._commandHistory.length > 0 && this._vCommandNumber < this._commandHistory.length - 1){
          this._vCommandNumber = (this._vCommandNumber + 1)%(this._commandHistory.length);
          this._command = this._commandHistory[this._vCommandNumber];
          this._ptrPosition = this._command.length;
          this.divideCommandForPtr();
        }
        break;
      }

      case 67: { //c-pressed
        if(this._lastKeyPressed == 17){ //Ctrl + C pressed
          break;  
        }
      }
      
      case 86: { //v-pressed
        if(this._lastKeyPressed == 17){ //Ctrl + v pressed
          break;  
        }
      }

      default:{
        if( (event.which > 8 && event.which < 47) || (event.which > 90 && event.which < 94) || (event.which > 111 && event.which < 146)){
          break;
        }
        this.appendToCommand(event.key);
        break;
      }
    }
    this._lastKeyPressed = event.which;
    this.renderPromptVariables();
    this.refreshTabFunctionElements();
  }

  /**
   * Handle the tab-pressed event
   */
  private tabKeyEvent(){
    if(this._ltOfDir.length == 0){
      const uri = this.getKuduUri();
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');
      headers.append('Authorization', `Basic ` + btoa(`${this._pubCred.properties.publishingUserName}:${this._pubCred.properties.publishingPassword}`));
      const body = {"command": "dir /b /a", "dir": this.dir}; //can use ls -a also
      const res = this._consoleService.send("POST", uri, JSON.stringify(body), headers);
      res.subscribe(
        data => {
          const output = data.json();
          if(output.ExitCode == 1){
            //unable to fetch the list of files/folders in the current directory
          }else{
            const cmd = this._command.substring(0, this._ptrPosition);
            const allFiles = output.Output.split("\r\n");
            this._ltOfDir = this._consoleService.findMatchingStrings(allFiles, cmd.substring(cmd.lastIndexOf(" ") + 1));
            if(this._ltOfDir.length == 0)
              return;
            this._dirIndex = 0;
            this._command = this._command.substring(0, this._ptrPosition);
            this._command = this._command.substring(0, this._command.lastIndexOf(" ") + 1) + this._ltOfDir[0];
            this._ptrPosition = this._command.length;
            this.divideCommandForPtr();
          }
          console.log(output);
        },
        err => {
          console.log("Tab Error: " + err);
        }
      );
      return;
    }
    this._command = this._command.substring(0, this._ptrPosition);
    this._command = this._command.substring(0, this._command.lastIndexOf(" ") + 1) + this._ltOfDir[(++this._dirIndex)%this._ltOfDir.length];
    this._ptrPosition = this._command.length;
    this.divideCommandForPtr();
  }

  /**
   * Backspace pressed by the user
   */
  private backspaceKeyEvent(){
    this.commandInParts.lCmd = this.commandInParts.lCmd.slice(0, -1);
    if(this._ptrPosition == this._command.length){
      this._command = this.commandInParts.lCmd;
      --this._ptrPosition;
      return;
    }
    this._command = this.commandInParts.lCmd + this.commandInParts.mCmd + this.commandInParts.rCmd;
    --this._ptrPosition;
    this.divideCommandForPtr();
  }

  /**
   * Handle the Enter key pressed operation
   */
  private enterKeyEvent(){
    const flag = this.performAction();
    this.removePrompt();
    this._commandHistory.push(this._command);
    this._vCommandNumber = this._commandHistory.length;
    if(flag){
      this.addMessageComponent();
      const res = this.connectToKudu();
      if(res){

      }
    }else{    
      this.addPromptComponent();              
    }
    this.resetCommand();   
  }

  /**
   * Get Kudu API URL
   */
  private getKuduUri() : string{
    let scmHostName = "funcplaceholder01.scm.azurewebsites.net";
    if(this._site){
      scmHostName = this._site.properties.hostNameSslStates.find(h => h.hostType === 1).name;
    }

    return `https://${scmHostName}/api/command`;
  }
  
  /**
   * Connect to the kudu API and display the response;
   * both incase of an error or a valid response
   */
  private connectToKudu(){
    const uri = this.getKuduUri();
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    if(!this._pubCred){
      headers.append('Authorization', `Basic ` + btoa(`admin:kudu`));
    }else{
      headers.append('Authorization', `Basic ` + btoa(`${this._pubCred.properties.publishingUserName}:${this._pubCred.properties.publishingPassword}`));
    }
    const cmd = this._command;
    const body = {"command": cmd, "dir": this.dir};
    const res = this._consoleService.send("POST", uri, JSON.stringify(body), headers);
    this._ongoingSub = res.subscribe(
      data => {
        const output = data.json();
        if(output.ExitCode == 1 && output.Output == ""){
          this.addErrorComponent(output.Error + "\r\n");
          this.addPromptComponent();              
        }else{
          this.addMessageComponent(output.Output + "\r\n");
          if(output.ExitCode == 0 && output.Output == ""){
            this.performAction(cmd);
          }
          this.addPromptComponent();              
        }
        console.log(output);
        return output;
      },
      err => {
        this.addErrorComponent(err.text);
      }
    );
  }

  /**
   * perform action on key pressed.
   */
  private performAction(cmd?: string){
    if(this._command.toLowerCase() == "cls"){
      this.removeMsgComponents();
      return false;
    }

    if(this._command.toLowerCase() == "exit"){
      this.removeMsgComponents();
      this.dir = "D:\\home\\site\\wwwroot";
      return false;
    }

    if(cmd && cmd.toLowerCase().startsWith("cd")){
      cmd = cmd.substring(2).trim().replace(/\//g,"\\").replace(/\\\\/g,"\\");
      const currentDirs = this.dir.split("\\");
      if(cmd == '\\'){
        this.dir = currentDirs[0];
      }else{
        const dirsInPath = cmd.split("\\");
        for(let i = 0;i<dirsInPath.length;++i){
          if(dirsInPath[i] == "."){
          }else if(dirsInPath[i] == "" || dirsInPath[i] == ".."){
            if(currentDirs.length == 1){
              break;
            }
            currentDirs.pop();
          }else{
            currentDirs.push(dirsInPath[i]);
          }
        }
        this.dir = currentDirs.join("\\");
      }
      return false;
    }
    return true;
  }

  /**
   * Divide the commands into left, current and right
   */
  private divideCommandForPtr(){
    
    if(this._ptrPosition < 0 || this._ptrPosition > this._command.length){
      return;
    }
    if(this._ptrPosition == this._command.length){
      this.commandInParts.lCmd = this._command;
      this.commandInParts.mCmd = " ";
      this.commandInParts.rCmd = "";
      return;
    }
    this.commandInParts.lCmd = this._command.substring(0, this._ptrPosition);
    this.commandInParts.mCmd = this._command.substring(this._ptrPosition, this._ptrPosition + 1);
    this.commandInParts.rCmd = this._command.substring(this._ptrPosition + 1, this._command.length);   
  }

 /**
   * Refresh the tab elements, 
   * i.e. the list of files/folder and the current dir index
   */
  private refreshTabFunctionElements(){
    this._ltOfDir.length = 0;
    this._dirIndex = -1;
  }

  /**
   * Reset the command
   */
  private resetCommand(){
    this._command = "";
    this.commandInParts.rCmd = "";
    this.commandInParts.lCmd = "";
    this.commandInParts.mCmd = " ";
    this._ptrPosition = 0;
  }

  /**
   * Add the text to the current command
   * @param cmd :String
   */
  private appendToCommand(cmd: string){
    if(this._ptrPosition == this._command.length){
      this.commandInParts.lCmd += cmd;
      this._command = this.commandInParts.lCmd;
      ++this._ptrPosition;
      //console.log(cmd);
      return;
    }
    //console.log(this.ptrPosition + "-" + this.command.length);
    this.commandInParts.lCmd += cmd;
    this._command = this.commandInParts.lCmd + this.commandInParts.mCmd + this.commandInParts.rCmd;
    ++this._ptrPosition;
    this.divideCommandForPtr();
  }

  /**
   * Render the dynamically loaded prompt box, 
   * i.e. pass in the updated command the inFocus value to the PromptComponent.
   */
  private renderPromptVariables(){
    if(this._currentPrompt){
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
  private addMessageComponent(message?: string){
    if(!this._messageComponent){
      this._messageComponent = this._componentFactoryResolver.resolveComponentFactory(MessageComponent);
    }
    const msgComponent = this.prompt.createComponent(this._messageComponent);
    msgComponent.instance.message = (message ? message : (this.dir + ">" + this._command));
    this._msgComponents.push(msgComponent);
  }

  /**
   * Creates a new prompt box,
   * created everytime a command is entered by the user and 
   * some response is generated from the server, or 'cls', 'exit'
   */
  private addPromptComponent(){
    if(!this._promptComponent){
      this._promptComponent = this._componentFactoryResolver.resolveComponentFactory(PromptComponent);
    }
    this._currentPrompt = this.prompt.createComponent(this._promptComponent);
    this._currentPrompt.instance.dir = this.dir;
  }

  /**
   * Create a error message
   * @param error : String, represents the error message to be shown
   */
  private addErrorComponent(error: string){
    if(!this._errorComponent){
      this._errorComponent = this._componentFactoryResolver.resolveComponentFactory(ErrorComponent);
    }
    const errorComponent = this.prompt.createComponent(this._errorComponent);
    this._msgComponents.push(errorComponent);
    errorComponent.instance.message = error;
  }

  /**
   * Remove all the message history
   */
  private removeMsgComponents(){
    /*for(var i = this._msgComponents.length - 1; i >= 0 && this._msgComponents[i];--i){
      this._msgComponents[i].destroy();
      this._msgComponents[i] = undefined;
    }*/
    let len = this._msgComponents.length;
    while(len > 0){
      --len;
      this._msgComponents.pop().destroy();
    }
  }

}
