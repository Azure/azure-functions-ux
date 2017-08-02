export class Diagnostic implements monaco.editor.IMarkerData {
  code: string;
  functionName: string;
  message: string;
  source: string;
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  severity : monaco.Severity;
}