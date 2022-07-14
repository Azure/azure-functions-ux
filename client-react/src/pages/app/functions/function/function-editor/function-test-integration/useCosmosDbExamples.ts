import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArmObj } from '../../../../../../models/arm-obj';
import { BindingDirection } from '../../../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../../../models/functions/function-info';
import { COSMOS_DB, COSMOS_DB_TRIGGER } from '../../../common/BindingTypeRegex';
import { getBindingDirection } from '../../integrate/FunctionIntegrate.utils';
import { ExampleProps, Examples } from './Example.types';
import code from './Examples';

const onLinkClick = () => {
  window.open('https://cosmosdb.azure.com', '_blank');
};

export const useCosmosDbExamples = (functionInfo: ArmObj<FunctionInfo>): Examples<ExampleProps> => {
  const { t } = useTranslation();

  const hasInputBinding = useMemo(() => {
    return functionInfo.properties.config.bindings.some(binding => {
      return getBindingDirection(binding) === BindingDirection.in && COSMOS_DB.test(binding.type);
    });
  }, [functionInfo.properties.config.bindings]);

  const hasOutputBinding = useMemo(() => {
    return functionInfo.properties.config.bindings.some(binding => {
      return getBindingDirection(binding) === BindingDirection.out && COSMOS_DB.test(binding.type);
    });
  }, [functionInfo.properties.config.bindings]);

  const hasTriggerBinding = useMemo(() => {
    return functionInfo.properties.config.bindings.some(binding => {
      return getBindingDirection(binding) === BindingDirection.trigger && COSMOS_DB_TRIGGER.test(binding.type);
    });
  }, [functionInfo.properties.config.bindings]);

  const language = useMemo(() => functionInfo.properties.language?.toLowerCase(), [functionInfo.properties.language]);

  const codeSamples = useMemo(() => {
    const match = Object.keys(code).find(key => key.toLowerCase() === language);
    if (!match) {
      return undefined;
    }

    return code[match];
  }, [language]);

  const input = useMemo<ExampleProps | undefined>(
    () =>
      codeSamples?.input && hasInputBinding
        ? {
            ...codeSamples.input,
            description: t('cosmosDb_testIntegration_description').format('Cosmos DB', 'Azure Cosmos DB'),
            headerText: t('cosmosDb_testIntegration_input_headerText').format('Cosmos DB'),
            linkText: t('cosmosDb_testIntegration_linkText').format('Cosmos DB'),
            onLinkClick,
          }
        : undefined,
    [codeSamples?.input, hasInputBinding, t]
  );

  const output = useMemo<ExampleProps | undefined>(
    () =>
      codeSamples?.output && hasOutputBinding
        ? {
            ...codeSamples.output,
            description: t('cosmosDb_testIntegration_description'),
            headerText: t('cosmosDb_testIntegration_output_headerText').format('Cosmos DB'),
            linkText: t('cosmosDb_testIntegration_linkText').format('Cosmos DB'),
            onLinkClick,
          }
        : undefined,
    [codeSamples?.output, hasOutputBinding, t]
  );

  const trigger = useMemo<ExampleProps | undefined>(
    () =>
      codeSamples?.trigger && hasTriggerBinding
        ? {
            ...codeSamples.trigger,
            description: t('cosmosDb_testIntegration_trigger_description').format('Cosmos DB', 'Azure Cosmos DB'),
            headerText: t('cosmosDb_testIntegration_trigger_headerText').format('Cosmos DB'),
            linkText: t('cosmosDb_testIntegration_linkText').format('Cosmos DB'),
            onLinkClick,
          }
        : undefined,
    [codeSamples?.trigger, hasTriggerBinding, t]
  );

  return {
    input,
    output,
    trigger,
  };
};
