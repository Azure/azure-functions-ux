import i18next from 'i18next';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding } from '../../../../models/functions/binding';
import { BindingInfo, BindingType } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { PortalContext } from '../../../../PortalContext';
import { ExperimentationConstants } from '../../../../utils/CommonConstants';
import CosmosDbFunctionFormBuilder from './CosmosDbFunctionFormBuilder';
import { CreateFunctionFormBuilder } from './CreateFunctionFormBuilder';
import { usePermissions } from './usePermissions';

export type CreateFunctionFormBuilderFactory = (
  bindingInfo: BindingInfo[],
  bindings: Binding[],
  resourceId: string,
  functionInfos: ArmObj<FunctionInfo>[],
  defaultName: string,
  t: i18next.TFunction
) => CreateFunctionFormBuilder;

const COSMOS_DB_TRIGGER = BindingType.cosmosDBTrigger.toLowerCase();

export const useCreateFunctionFormBuilderFactory = (resourceId: string, templateId: string) => {
  const portalCommunicator = useContext(PortalContext);
  const { hasAppSettingsPermissions, hasResourceGroupWritePermission, hasSubscriptionWritePermission } = usePermissions(resourceId);
  const [hasFlightEnabled, setHasFlightEnabled] = useState(false);
  const [factory, setFactory] = useState<CreateFunctionFormBuilderFactory>();

  const cosmosDbFunctionFormBuilder = useCallback<() => CreateFunctionFormBuilderFactory>(
    () => (bindingInfo, bindings, resourceId, functionInfos, defaultName, t) => {
      return new CosmosDbFunctionFormBuilder(bindingInfo, bindings, resourceId, functionInfos, defaultName, t, {
        hasAppSettingsPermissions,
        hasResourceGroupWritePermission,
        hasSubscriptionWritePermission,
      });
    },
    [hasAppSettingsPermissions, hasResourceGroupWritePermission, hasSubscriptionWritePermission]
  );

  const createFunctionFormBuilder = useCallback<() => CreateFunctionFormBuilderFactory>(
    () => (bindingInfo, bindings, resourceId, functionInfos, defaultName, t) => {
      return new CreateFunctionFormBuilder(bindingInfo, bindings, resourceId, functionInfos, defaultName, t);
    },
    []
  );

  useEffect(() => {
    portalCommunicator.hasFlightEnabled(ExperimentationConstants.TreatmentFlight.functionsCollateral).then(setHasFlightEnabled);
  }, [portalCommunicator]);

  useEffect(() => {
    const [lowerTemplateIdWithoutLanguage] = templateId.toLowerCase().split('-');

    switch (lowerTemplateIdWithoutLanguage) {
      case COSMOS_DB_TRIGGER:
        setFactory(hasFlightEnabled ? cosmosDbFunctionFormBuilder : createFunctionFormBuilder);
        break;

      default:
        setFactory(createFunctionFormBuilder);
        break;
    }
  }, [cosmosDbFunctionFormBuilder, createFunctionFormBuilder, hasFlightEnabled, templateId]);

  return factory;
};
