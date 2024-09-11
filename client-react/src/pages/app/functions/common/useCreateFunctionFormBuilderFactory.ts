import { TFunction } from 'i18next';
import { useCallback, useEffect, useState } from 'react';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding } from '../../../../models/functions/binding';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { CreateFunctionFormBuilder } from './CreateFunctionFormBuilder';

export type CreateFunctionFormBuilderFactory = (
  bindingInfo: BindingInfo[],
  bindings: Binding[],
  resourceId: string,
  functionInfos: ArmObj<FunctionInfo>[],
  defaultName: string,
  t: TFunction
) => CreateFunctionFormBuilder;

export const useCreateFunctionFormBuilderFactory = () => {
  const [factory, setFactory] = useState<CreateFunctionFormBuilderFactory>();

  const createFunctionFormBuilder = useCallback<() => CreateFunctionFormBuilderFactory>(
    () => (bindingInfo, bindings, resourceId, functionInfos, defaultName, t) => {
      return new CreateFunctionFormBuilder(bindingInfo, bindings, resourceId, functionInfos, defaultName, t);
    },
    []
  );

  useEffect(() => {
    setFactory(createFunctionFormBuilder);
  }, [createFunctionFormBuilder]);

  return factory;
};
