import { AppLogStreamComponent } from './log-stream.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { LogEntryComponent } from './log-entry.component';

@NgModule({
  imports: [TranslateModule.forChild(), SharedModule],
  entryComponents: [AppLogStreamComponent, LogEntryComponent],
  declarations: [AppLogStreamComponent, LogEntryComponent],
  providers: [],
  exports: [AppLogStreamComponent, LogEntryComponent],
})
export class LogStreamModule {}
