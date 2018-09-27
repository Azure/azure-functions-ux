import { PortalService } from './../shared/services/portal.service';
import { TranslateService } from '@ngx-translate/core';
import { BroadcastService } from './../shared/services/broadcast.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { Component, Input, Output } from '@angular/core';
import { RuntimeExtension } from '../shared/models/binding';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { BaseExtensionInstallComponent } from 'app/extension-install/base-extension-install-component';
import { AiService } from '../shared/services/ai.service';

@Component({
    selector: 'extension-install',
    templateUrl: './extension-install.component.html',
    styleUrls: ['./extension-install.component.scss'],
})
export class ExtensionInstallComponent extends BaseExtensionInstallComponent {
    @Input() integrateText;
    @Input() loading = false;
    @Input() installing = false;
    @Output() installed: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(
        broadcastService: BroadcastService,
        translateService: TranslateService,
        aiService: AiService,
        portalService: PortalService,
        _functionAppService: FunctionAppService) {
        super('extension-install', _functionAppService, broadcastService, aiService, translateService, portalService);
    }

    @Input() set requiredExtensions(inputExtensions: RuntimeExtension[]) {
        this.runtimeExtensions = inputExtensions;
        if (this.runtimeExtensions && this.runtimeExtensions.length > 0) {
            this.loading = true;
            this.getNeededExtensions(this.runtimeExtensions)
                .subscribe(extensions => {
                    this.loading = false;
                    this.neededExtensions = extensions;
                    this.installed.next(this.neededExtensions.length === 0);
                });
        } else {
            this.installed.next(true);
            this.neededExtensions = [];
        }
    }
}
