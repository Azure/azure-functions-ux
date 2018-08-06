import { AiService } from 'app/shared/services/ai.service';
import { FunctionAppService } from 'app/shared/services/function-app.service';
import { BroadcastService } from './../shared/services/broadcast.service';
import { FunctionAppContext } from 'app/shared/function-app-context';
import { errorIds } from './../shared/models/error-ids';
import { PortalResources } from './../shared/models/portal-resources';
import { FunctionAppContextComponent } from 'app/shared/components/function-app-context-component';
import { TranslateService } from '@ngx-translate/core';

export abstract class BaseExtensionInstallComponent extends FunctionAppContextComponent {

    constructor(
        componentName: string,
        functionAppService: FunctionAppService,
        broadcastService: BroadcastService,
        private _aiService: AiService,
        public translateService: TranslateService,
        setBusy?: Function) {
        super(componentName, functionAppService, broadcastService, setBusy);
    }

    showTimeoutError(context: FunctionAppContext) {
        this.showComponentError({
            message: this.translateService.instant(PortalResources.timeoutInstallingFunctionRuntimeExtension),
            errorId: errorIds.timeoutInstallingFunctionRuntimeExtension,
            resourceId: context.site.id
        });

        this._aiService.trackEvent(errorIds.timeoutInstallingFunctionRuntimeExtension, {
            content: this.translateService.instant(PortalResources.timeoutInstallingFunctionRuntimeExtension)
        });
    }

    showInstallFailed(context: FunctionAppContext, id) {
        this.showComponentError({
            message: this.translateService.instant(PortalResources.failedToInstallFunctionRuntimeExtensionForId, { installationId: id }),
            errorId: errorIds.timeoutInstallingFunctionRuntimeExtension,
            resourceId: context.site.id
        });

        this._aiService.trackEvent(errorIds.timeoutInstallingFunctionRuntimeExtension, {
            content: this.translateService.instant(PortalResources.failedToInstallFunctionRuntimeExtension)
        });
    }
}
