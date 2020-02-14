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
    const srcMultiPhaseCtrl: FormControl = group.get('srcMultiPhase') as FormControl;
    const destIdCtrl: FormControl = group.get('destId') as FormControl;
    const destAuthCtrl: FormControl = group.get('destAuth') as FormControl;
    const destMultiPhaseCtrl: FormControl = group.get('destMultiPhase') as FormControl;
    const multiPhaseCtrl: FormControl = group.get('multiPhase') as FormControl;

    if (!srcIdCtrl || !srcAuthCtrl || !srcMultiPhaseCtrl || !destIdCtrl || !destAuthCtrl || !destMultiPhaseCtrl || !multiPhaseCtrl) {
      throw new Error(
        'Validator requires FormGroup with the following controls: srcId, srcAuth, srcMultiPhase, destId, destAuth, destMultiPhase, multiPhase'
      );
    }

    if (srcIdCtrl.value === destIdCtrl.value) {
      errors = errors || {};
      errors['slotsNotUnique'] = this._translateService.instant(PortalResources.swapSrcDestNotUnique);
    }

    // If the multi-phase checkbox is checked, we verify the following:
    //  - Neither slot has auth enabled
    //  - Both slots have the necessary permissions for multi-phase swap operations
    if (multiPhaseCtrl.value) {
      const srcDescriptor = srcIdCtrl.value ? new ArmSiteDescriptor(srcIdCtrl.value) : null;
      const destDescriptor = destIdCtrl.value ? new ArmSiteDescriptor(destIdCtrl.value) : null;

      const srcName = srcDescriptor ? srcDescriptor.slot || 'production' : null;
      const destName = destDescriptor ? destDescriptor.slot || 'production' : null;

      // auth check
      const authEnabledSlotNames = [];

      if (srcAuthCtrl.value) {
        authEnabledSlotNames.push(srcName);
      }

      if (destAuthCtrl.value) {
        authEnabledSlotNames.push(destName);
      }

      if (authEnabledSlotNames.length > 0) {
        errors = errors || {};
        const slotNames = authEnabledSlotNames.join(', ');
        errors['authMultiPhaseConflict'] = this._translateService.instant(PortalResources.swapMultiPhaseAuthConflict, {
          slotNames: slotNames,
        });
      }

      // permissions check
      const multiPhaseNoPermissionsSlotNames = [];

      if (!srcMultiPhaseCtrl.value) {
        multiPhaseNoPermissionsSlotNames.push(srcName);
      }

      if (!destMultiPhaseCtrl.value) {
        multiPhaseNoPermissionsSlotNames.push(destName);
      }

      if (multiPhaseNoPermissionsSlotNames.length > 0) {
        errors = errors || {};
        const slotNames = multiPhaseNoPermissionsSlotNames.join(', ');
        errors['permissionsMultiPhaseFailure'] = this._translateService.instant(PortalResources.swapMultiPhasePermissionsFailure, {
          slotNames: slotNames,
        });
      }
    }

    return errors;
  }
}
