import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';

import { Link } from '@fluentui/react';

import { getErrorMessage } from '../../../../../ApiHelpers/ArmHelper';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import BasicShimmerLines from '../../../../../components/shimmer/BasicShimmerLines';
import { ArmObj } from '../../../../../models/arm-obj';
import { Binding } from '../../../../../models/functions/binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { FunctionTemplate } from '../../../../../models/functions/function-template';
import { PortalContext } from '../../../../../PortalContext';
import { IArmResourceTemplate, TSetArmResourceTemplates } from '../../../../../utils/ArmTemplateHelper';
import { Links } from '../../../../../utils/FwLinks';
import { LogCategories } from '../../../../../utils/LogCategories';
import { CreateFunctionFormBuilder, CreateFunctionFormValues } from '../../common/CreateFunctionFormBuilder';
import { getTelemetryInfo } from '../../common/FunctionsUtility';
import { useCreateFunctionFormBuilderFactory } from '../../common/useCreateFunctionFormBuilderFactory';
import { getBindingDirection } from '../../function/integrate/FunctionIntegrate.utils';
import FunctionCreateData from '../FunctionCreate.data';
import { detailContainerStyle } from '../FunctionCreate.styles';
import { FunctionCreateContext } from '../FunctionCreateContext';

export interface TemplateDetailProps {
  formProps: FormikProps<CreateFunctionFormValues>;
  resourceId: string;
  selectedTemplate: FunctionTemplate;
  armResources?: IArmResourceTemplate[];
  builder?: CreateFunctionFormBuilder;
  setArmResources?: TSetArmResourceTemplates;
  setBuilder: React.Dispatch<React.SetStateAction<CreateFunctionFormBuilder | undefined>>;
}

const TemplateDetail: React.FC<TemplateDetailProps> = ({
  formProps,
  resourceId,
  selectedTemplate,
  armResources,
  builder,
  setArmResources,
  setBuilder,
}: TemplateDetailProps) => {
  const { t } = useTranslation();

  const [functionsInfo, setFunctionsInfo] = useState<ArmObj<FunctionInfo>[] | null>();
  const [bindings, setBindings] = useState<Binding[] | null>();

  const functionCreateContext = useContext(FunctionCreateContext);
  const portalCommunicator = useContext(PortalContext);

  const factory = useCreateFunctionFormBuilderFactory();

  const requiredBindingIds = useMemo(() => {
    const bindingIds = new Set<string>();
    for (const prompt of selectedTemplate.userPrompt ?? []) {
      for (const binding of selectedTemplate.bindings ?? []) {
        if (binding[prompt]) {
          bindingIds.add(`${binding.type}-${getBindingDirection(binding)}`);
        }
      }
    }

    return Array.from(bindingIds);
  }, [selectedTemplate]);

  useEffect(() => {
    if (!!functionsInfo && !!bindings && !!factory) {
      setBuilder(
        factory(
          selectedTemplate.bindings ?? [],
          bindings,
          resourceId,
          functionsInfo,
          selectedTemplate.defaultFunctionName || 'NewFunction',
          t
        )
      );
    }
  }, [bindings, functionsInfo, factory, resourceId, selectedTemplate.bindings, selectedTemplate.defaultFunctionName, setBuilder, t]);

  useEffect(() => {
    setBindings(undefined);
    setBuilder(undefined);

    Promise.all(
      requiredBindingIds.map(bindingId =>
        FunctionCreateData.getBinding(resourceId, bindingId).then(response => {
          if (response.metadata.success) {
            return response.data.properties[0];
          } else {
            portalCommunicator.log(
              getTelemetryInfo('info', LogCategories.localDevExperience, 'getBindings', {
                errorAsString: response.metadata.error ? JSON.stringify(response.metadata.error) : '',
                message: getErrorMessage(response.metadata.error),
              })
            );
            return undefined;
          }
        })
      )
    ).then(allBindings => {
      setBindings(allBindings.some(binding => !binding) ? null : getRequiredCreationBindings(allBindings, selectedTemplate.userPrompt));
    });
  }, [portalCommunicator, requiredBindingIds, resourceId, selectedTemplate.userPrompt, setBuilder]);

  useEffect(() => {
    FunctionsService.getFunctions(resourceId).then(response => {
      if (response.metadata.success) {
        setFunctionsInfo(response.data.value);
      } else {
        setFunctionsInfo(null);
        portalCommunicator.log(
          getTelemetryInfo('info', LogCategories.localDevExperience, 'getFunctionsInfo', {
            errorAsString: response.metadata.error ? JSON.stringify(response.metadata.error) : '',
            message: getErrorMessage(response.metadata.error),
          })
        );
      }
    });
  }, [portalCommunicator, resourceId]);

  return functionsInfo === null || bindings === null ? /** TODO(krmitta): Add banner when call fails */ null : (
    <div className={detailContainerStyle}>
      <h3>{t('templateDetails')}</h3>
      <p>
        {t('detailDescription').format(selectedTemplate.name)}
        <Link href={Links.functionCreateBindingsLearnMore} rel="noopener" target="_blank">
          {t('learnMore')}
        </Link>
      </p>
      {!functionsInfo || !bindings || !builder ? (
        <BasicShimmerLines />
      ) : (
        builder.getFields(formProps, !!functionCreateContext.creatingFunction, false, armResources, setArmResources)
      )}
    </div>
  );
};

// Not all bindings are required for function creation. Only display bindings listed in 'userPrompt`.
const getRequiredCreationBindings = (bindings: Binding[], userPrompt: string[] = []): Binding[] =>
  bindings.map(binding => ({
    ...binding,
    settings: binding.settings?.filter(setting => !!userPrompt.find(prompt => prompt === setting.name)),
  }));

export default TemplateDetail;
