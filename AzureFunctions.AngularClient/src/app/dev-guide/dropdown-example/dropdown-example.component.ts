import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { RequiredValidator } from '../../shared/validators/requiredValidator';
import { TranslateService } from '@ngx-translate/core';
import { HighlightService } from '../highlight.service';


@Component({
  selector: 'app-dropdown-example',
  templateUrl: './dropdown-example.component.html',
  styleUrls: ['./dropdown-example.component.scss']
})
export class DropdownExampleComponent {
  highlighted = false;
  public FormGroupExample;
  public items = [
    {
      displayLabel: 'Github',
      value: 'github'
    },
    {
      displayLabel: 'Visual Studio Online',
      value: 'vso'
    },
    {
      displayLabel: 'Bitbucket',
      value: 'bitbucket'
    },
    {
      displayLabel: 'FTP',
      value: 'ftp'
    }];
  public chosenValue;
  constructor(
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    highlightService: HighlightService
  ) {
    this.htmlCode = highlightService.highlightString(this.htmlCode, 'html');
    this.typescriptCode = highlightService.highlightString(this.typescriptCode, 'typescript');

    const required = new RequiredValidator(this._translateService);
    this.FormGroupExample = this._fb.group({
      sourceProvider: [this.chosenValue, [required.validate.bind(required)]]
    });
   }

  // tslint:disable-next-line:member-ordering
  public htmlCode = `
  <div [formGroup]="FormGroupExample" novalidate>
    <ng-select class="custom-select" [items]="items" bindLabel="displayLabel" bindValue="value" placeholder="Select source" [(ngModel)]="chosenValue"
      formControlName="sourceProvider">
    </ng-select>
    <!--  This invalidmessage directive injects the error message on a validation failure, input is control name -->
    <div invalidmessage="sourceProvider"></div>
    <h4>ngModel value: {{chosenValue}}</h4>
    <h4>formValue value: {{FormGroupExample?.value?.sourceProvider}}</h4>
  </div>`;

  // tslint:disable-next-line:member-ordering
  public typescriptCode = `
export class DropdownExampleComponent {
  highlighted = false;
  public FormGroupExample;
  public items = [
    {
      displayLabel: 'Github',
      value: 'github'
    },
    {
      displayLabel: 'Visual Studio Online',
      value: 'vso'
    },
    {
      displayLabel: 'Bitbucket',
      value: 'bitbucket'
    },
    {
      displayLabel: 'FTP',
      value: 'ftp'
    }];
  public chosenValue;
  constructor(
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    highlightService: HighlightService
  ) {
    this.htmlCode = highlightService.highlightString(this.htmlCode, 'html');
    this.typescriptCode = highlightService.highlightString(this.typescriptCode, 'typescript');

    const required = new RequiredValidator(this._translateService);
    this.FormGroupExample = this._fb.group({
      sourceProvider: [this.chosenValue, [required.validate.bind(required)]]
    });
   }
  }`;
}
