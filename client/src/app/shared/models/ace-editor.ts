export interface AceEditor {
  setValue(str: string);
  getValue(): string;
  clearSelection();
  moveCursorTo(x: number, y: number);
  focus();
  resize(flag?: boolean);
  on(eventName: string, x: any);
  session: AceEditorSession;
  getSession(): AceEditorSession;
  setTheme(theme: string);
  setOptions(options: any);
  $blockScrolling: number;
  commands: any;
  curOp: any;
  setReadOnly(value: boolean);
}

interface AceEditorSession {
  setMode(mode: string);
  setTabSize(size: number);
  setUseSoftTabs(flag: boolean);
  setValue(str: string);
}
