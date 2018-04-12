import { FormControl } from '@angular/forms';

export interface GeneralSettingsControls {
  clientAffinityEnabled: FormControl;
  use32BitWorkerProcess: FormControl;
  webSocketsEnabled: FormControl;
  alwaysOn: FormControl;
  managedPipelineMode: FormControl;
  remoteDebuggingEnabled: FormControl;
  remoteDebuggingVersion: FormControl;
}