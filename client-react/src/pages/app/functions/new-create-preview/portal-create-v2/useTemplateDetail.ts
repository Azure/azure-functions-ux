import { IDropdownOption } from '@fluentui/react';
import { FormikProps } from 'formik';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FunctionTemplateV2 } from '../../../../../models/functions/function-template-v2';
import { useUserPromptQuery } from '../../function/hooks/useUserPromptQuery';
import { JobType } from './JobType';
import { useFields } from './useFields';
import { useFunctionAppFileDetector } from './useFunctionAppFileDetector';

export function useTemplateDetail(
  formProps: FormikProps<Record<string, unknown>>,
  resourceId: string,
  selectedTemplate: FunctionTemplateV2
) {
  const { t } = useTranslation();

  const { userPrompts } = useUserPromptQuery(resourceId);

  const { blueprintsExist, functionAppExists } = useFunctionAppFileDetector(resourceId);

  const jobType = useMemo<string | undefined>(() => {
    return typeof formProps.values.jobType === 'string' ? formProps.values.jobType : undefined;
  }, [formProps.values.jobType]);

  const { fields, makeTextValidator } = useFields(resourceId, jobType, selectedTemplate, userPrompts);

  const jobTypeOptions = useMemo<IDropdownOption<unknown>[]>(
    () => [
      ...when(
        functionAppExists,
        { key: JobType.AppendToFile, text: t('jobType_appendToFile') },
        { key: JobType.CreateNewApp, text: t('jobType_createNewApp') }
      ),
      ...when(blueprintsExist, { key: JobType.AppendToBlueprint, text: t('jobType_appendToBlueprint') }),
      ...when(functionAppExists, { key: JobType.CreateNewBlueprint, text: t('jobType_createNewBlueprint') }),
    ],
    [blueprintsExist, functionAppExists, t]
  );

  return {
    fields,
    jobTypeOptions,
    makeTextValidator,
  };
}

function when<T>(condition = false, option: IDropdownOption<T>, otherwise?: IDropdownOption<T>) {
  return condition ? [option] : otherwise ? [otherwise] : [];
}
