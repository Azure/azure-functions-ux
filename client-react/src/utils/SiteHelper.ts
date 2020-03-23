import { FunctionAppEditMode } from '../models/portal-models';
import i18n from './i18n';
import { ArmObj } from '../models/arm-obj';
import { Site } from '../models/site/site';
import { SiteConfig } from '../models/site/config';
import { isPremiumV2 } from './arm-utils';

export default class SiteHelper {
  public static isFunctionAppReadOnly(editMode: FunctionAppEditMode): boolean {
    return (
      editMode === FunctionAppEditMode.ReadOnly ||
      editMode === FunctionAppEditMode.ReadOnlySourceControlled ||
      editMode === FunctionAppEditMode.ReadOnlySlots ||
      editMode === FunctionAppEditMode.ReadOnlyVSGenerated ||
      editMode === FunctionAppEditMode.ReadOnlyRunFromPackage ||
      editMode === FunctionAppEditMode.ReadOnlyLocalCache ||
      editMode === FunctionAppEditMode.ReadOnlyLinuxDynamic ||
      editMode === FunctionAppEditMode.ReadOnlyBYOC ||
      editMode === FunctionAppEditMode.ReadOnlyPython ||
      editMode === FunctionAppEditMode.ReadOnlyJava ||
      editMode === FunctionAppEditMode.ReadOnlyLinuxCodeElastic ||
      editMode === FunctionAppEditMode.ReadOnlyLock ||
      editMode === FunctionAppEditMode.ReadOnlyRbac
    );
  }

  public static getFunctionAppEditModeString(mode: FunctionAppEditMode, t: i18n.TFunction): string {
    switch (mode) {
      case FunctionAppEditMode.ReadOnlySourceControlled: {
        return t('readOnlySourceControlled');
      }
      case FunctionAppEditMode.ReadOnlySlots: {
        return t('readOnlySlots');
      }
      case FunctionAppEditMode.ReadOnlyVSGenerated: {
        return t('readOnlyVSGenerated');
      }
      case FunctionAppEditMode.ReadOnlyRunFromPackage: {
        return t('readOnlyRunFromZip');
      }
      case FunctionAppEditMode.ReadOnlyLocalCache: {
        return t('readOnlyLocalCache');
      }
      case FunctionAppEditMode.ReadOnlyLinuxDynamic: {
        return t('readOnlyLinuxDynamic');
      }
      case FunctionAppEditMode.ReadOnlyBYOC: {
        return t('readOnlyBYOC');
      }
      case FunctionAppEditMode.ReadOnlyPython: {
        return t('readOnlyPython');
      }
      case FunctionAppEditMode.ReadOnlyJava: {
        return t('readOnlyJava');
      }
      case FunctionAppEditMode.ReadOnlyLock: {
        return t('featureDisabledReadOnlyLockOnApp');
      }
      case FunctionAppEditMode.ReadOnlyRbac: {
        return t('readOnlyRbac');
      }
    }
    return t('readOnly');
  }

  public static isFlexStamp(site: ArmObj<Site>) {
    return (
      !!site.properties.possibleInboundIpAddresses && site.properties.possibleInboundIpAddresses.split(',').length > 1 && isPremiumV2(site)
    );
  }

  public static isSourceControlEnabled(config: ArmObj<SiteConfig>) {
    return !config.properties.scmType || config.properties.scmType !== 'None';
  }
}
