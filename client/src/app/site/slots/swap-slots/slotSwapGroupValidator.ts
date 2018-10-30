import { FormControl, FormGroup, Validator, ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ArmSiteDescriptor } from './../../../shared/resourceDescriptors';
import { PortalResources } from './../../../shared/models/portal-resources';

export class SlotSwapGroupValidator implements Validator {
  constructor(private _translateService: TranslateService) {}

  validate(group: FormGroup) {
    let errors: ValidationErrors = null;

    const srcIdCtrl: FormControl = group.get('srcId') as FormControl;
    const srcAuthCtrl: FormControl = group.get('srcAuth') as FormControl;
    const destIdCtrl: FormControl = group.get('destId') as FormControl;
    const destAuthCtrl: FormControl = group.get('destAuth') as FormControl;
    const multiPhaseCtrl: FormControl = group.get('multiPhase') as FormControl;

    if (!srcIdCtrl || !srcAuthCtrl || !destIdCtrl || !destAuthCtrl || !multiPhaseCtrl) {
      throw new Error('Validator requires FormGroup with the following controls: srcId, srcAuth, destId, destAuth, multiPhase');
    }

    if (srcIdCtrl.value === destIdCtrl.value) {
      errors = errors || {};
      errors['slotsNotUnique'] = this._translateService.instant(PortalResources.swapSrcDestNotUnique);
    }

    if (multiPhaseCtrl.value) {
      const authEnabledSlotNames = [];

      if (srcAuthCtrl.value) {
        const srcDescriptor = new ArmSiteDescriptor(srcIdCtrl.value);
        authEnabledSlotNames.push(srcDescriptor.slot || 'production');
      }

      if (destAuthCtrl.value) {
        const destDescriptor = new ArmSiteDescriptor(destIdCtrl.value);
        authEnabledSlotNames.push(destDescriptor.slot || 'production');
      }

      if (authEnabledSlotNames.length > 0) {
        errors = errors || {};
        const slotNames = authEnabledSlotNames.join(', ');
        errors['authMultiPhaseConflict'] = this._translateService.instant(PortalResources.swapMultiPhaseAuthConflict, {
          slotNames: slotNames,
        });
      }
    }

    return errors;
  }
}
