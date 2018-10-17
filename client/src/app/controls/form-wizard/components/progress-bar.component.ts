import { Component, Input } from '@angular/core';

export type ProgressBarStepStatus = 'default' | 'current' | 'running' | 'done' | 'failed';

export interface ProgressBarStep {
  status: ProgressBarStepStatus;
  symbol: string;
  title: string;
}

@Component({
  selector: 'progress-bar',
  templateUrl: 'progress-bar.component.html',
  styleUrls: ['wizard-navigation-bar.component.scss'],
})
export class ProgressBarComponent {
  @Input()
  steps: ProgressBarStep[];
}
