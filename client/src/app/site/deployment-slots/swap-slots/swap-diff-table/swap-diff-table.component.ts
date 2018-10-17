import { Component, Input } from '@angular/core';
import { SimpleSlotsDiff } from './../../../../shared/models/arm/slots-diff';

@Component({
  selector: 'swap-diff-table',
  templateUrl: './swap-diff-table.component.html',
  styleUrls: ['./../../common.scss', './../swap-slots.component.scss'],
})
export class SwapDiffTableComponent {
  @Input()
  loading = true;
  @Input()
  invalid = false;
  @Input()
  loadedOrFailed = false;
  @Input()
  diffs: SimpleSlotsDiff[] = null;
  @Input()
  showToggle = false;
  @Input()
  oldValueHeading: string;
  @Input()
  newValueHeading: string;

  previewSource = true;

  constructor() {}
}
