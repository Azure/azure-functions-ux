import { FunctionTemplateV2 } from '../../../../../models/functions/function-template-v2';
import { useUserPromptQuery } from '../../function/hooks/useUserPromptQuery';
import { useFields } from './useFields';
import { useFunctionAppFileDetector } from './useFunctionAppFileDetector';

export function useTemplateDetail(resourceId: string, selectedTemplate: FunctionTemplateV2) {
  const { userPrompts } = useUserPromptQuery(resourceId);

  const functionAppExists = useFunctionAppFileDetector(resourceId);

  const fields = useFields(functionAppExists, resourceId, selectedTemplate, userPrompts);

  return fields;
}
