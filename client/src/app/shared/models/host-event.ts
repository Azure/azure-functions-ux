export interface HostEvent {
  id: string;
  name: string;
  functionName: string;
  diagnostics: monaco.editor.IMarkerData[];
}
