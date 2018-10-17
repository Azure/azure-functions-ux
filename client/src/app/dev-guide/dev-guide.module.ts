import { EditableTblExampleComponent } from './editable-tbl-example/editable-tbl-example.component';
import { TblExampleComponent } from './tbl-example/tbl-example.component';
import { RadioSelectorExampleComponent } from './radio-selector-example/radio-selector-example.component';
import { TextboxExampleComponent } from './textbox-example/textbox-example.component';
import { TabsComponent } from './../controls/tabs/tabs.component';
import { SvgExampleComponent } from './svg-example/svg-example.component';
import { ColorExampleComponent } from './color-example/color-example.component';
import { ButtonExampleComponent } from './button-example/button-example.component';
import { ListExampleComponent } from './list-example/list-example.component';
import { TypographyExampleComponent } from './typography-example/typography-example.component';
import { DevGuideComponent } from './dev-guide.component';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from './../shared/shared.module';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { DropdownExampleComponent } from './dropdown-example/dropdown-example.component';
import { HighlightService } from './highlight.service';
import { SidepanelExampleComponent } from './sidepanel-example/sidepanel-example.component';
import { SidebarModule } from 'ng-sidebar';
import { NgSelectModule } from '@ng-select/ng-select';

const routing: ModuleWithProviders = RouterModule.forChild([
  {
    path: '**',
    component: DevGuideComponent,
  },
]);

@NgModule({
  imports: [TranslateModule.forChild(), SharedModule, routing, SidebarModule, NgSelectModule],
  declarations: [
    TabsComponent,
    DevGuideComponent,
    TypographyExampleComponent,
    ListExampleComponent,
    ButtonExampleComponent,
    ColorExampleComponent,
    SvgExampleComponent,
    TextboxExampleComponent,
    RadioSelectorExampleComponent,
    TblExampleComponent,
    EditableTblExampleComponent,
    DropdownExampleComponent,
    SidepanelExampleComponent,
  ],
  providers: [HighlightService],
})
export class DevGuideModule {}
