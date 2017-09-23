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

const routing: ModuleWithProviders = RouterModule.forChild([
    {
        path: '', component: DevGuideComponent
    }
]);

@NgModule({
    imports: [
        TranslateModule.forChild(),
        SharedModule,
        routing
    ],
    declarations: [
        DevGuideComponent,
        TypographyExampleComponent,
        ListExampleComponent,
        ButtonExampleComponent,
        ColorExampleComponent,
        SvgExampleComponent
    ],
    providers: []
})
export class DevGuideModule { }
