import i18next from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding } from '../../../../models/functions/binding';
import { BindingInfo, BindingType } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { CommonConstants } from '../../../../utils/CommonConstants';
import Url from '../../../../utils/url';
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

const showFunctionsCollateral = !!Url.getFeatureValue(CommonConstants.FeatureFlags.showFunctionsColleteral);

export const useCreateFunctionFormBuilderFactory = (resourceId: string, templateId: string) => {
  const { hasAppSettingsPermissions, hasResourceGroupWritePermission, hasSubscriptionWritePermission } = usePermissions(resourceId);

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
    const [lowerTemplateIdWithoutLanguage] = templateId.toLowerCase().split('-');

    switch (lowerTemplateIdWithoutLanguage) {
      case COSMOS_DB_TRIGGER:
        setFactory(showFunctionsCollateral ? cosmosDbFunctionFormBuilder : createFunctionFormBuilder);
        break;

      default:
        setFactory(createFunctionFormBuilder);
        break;
    }
  }, [cosmosDbFunctionFormBuilder, createFunctionFormBuilder, templateId]);

  return factory;
};
