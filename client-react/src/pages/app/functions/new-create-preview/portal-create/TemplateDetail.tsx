import { Link } from '@fluentui/react';
import { FormikProps } from 'formik';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import BasicShimmerLines from '../../../../../components/shimmer/BasicShimmerLines';
import { ArmObj } from '../../../../../models/arm-obj';
import { Binding } from '../../../../../models/functions/binding';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { FunctionTemplate } from '../../../../../models/functions/function-template';
import { IArmResourceTemplate, TSetArmResourceTemplates } from '../../../../../utils/ArmTemplateHelper';
import { Links } from '../../../../../utils/FwLinks';
import { LogCategories } from '../../../../../utils/LogCategories';
import LogService from '../../../../../utils/LogService';
import { CreateFunctionFormBuilder, CreateFunctionFormValues } from '../../common/CreateFunctionFormBuilder';
import { getBindingDirection } from '../../function/integrate/FunctionIntegrate.utils';
import FunctionCreateData from '../FunctionCreate.data';
import { detailContainerStyle } from '../FunctionCreate.styles';
import { FunctionCreateContext } from '../FunctionCreateContext';

export interface TemplateDetailProps {
  resourceId: string;
  selectedTemplate: FunctionTemplate;
  formProps: FormikProps<CreateFunctionFormValues>;
  setBuilder: (builder?: CreateFunctionFormBuilder) => void;
  builder?: CreateFunctionFormBuilder;
  armResources?: IArmResourceTemplate[];
  setArmResources?: TSetArmResourceTemplates;
}

const TemplateDetail: React.FC<TemplateDetailProps> = (props: TemplateDetailProps) => {
  const { resourceId, selectedTemplate, formProps, builder, setBuilder, armResources, setArmResources } = props;
  const { t } = useTranslation();

  const [functionsInfo, setFunctionsInfo] = useState<ArmObj<FunctionInfo>[] | undefined | null>(undefined);
  const [bindings, setBindings] = useState<Binding[] | undefined | null>(undefined);

  const functionCreateContext = useContext(FunctionCreateContext);

  const fetchFunctionInfo = async () => {
    const functionsInfoResponse = await FunctionsService.getFunctions(resourceId);

    if (functionsInfoResponse.metadata.success) {
      setFunctionsInfo(functionsInfoResponse.data.value);
    } else {
      setFunctionsInfo(null);
      LogService.trackEvent(
        LogCategories.localDevExperience,
        'getFunctionsInfo',
        `Failed to get functions info: ${getErrorMessageOrStringify(functionsInfoResponse.metadata.error)}`
      );
    }
  };

  const fetchBindings = async () => {
    const bindingIds = getRequiredBindingIds(selectedTemplate);
    const allBindings: Binding[] = [];
    for (const bindingId of bindingIds) {
      const bindingPromise = await FunctionCreateData.getBinding(resourceId, bindingId);
      if (bindingPromise.metadata.success) {
        allBindings.push(bindingPromise.data.properties[0]);
      } else {
        setBindings(null);
        LogService.trackEvent(
          LogCategories.localDevExperience,
          'getBindings',
          `Failed to get bindings: ${getErrorMessageOrStringify(bindingPromise.metadata.error)}`
        );
      }
    }
    setBindings(
      selectedTemplate.userPrompt && selectedTemplate.userPrompt.length > 0
        ? getRequiredCreationBindings(allBindings, selectedTemplate.userPrompt)
        : []
    );
  };

  const getRequiredBindingIds = (template: FunctionTemplate): string[] => {
    const requiredBindingIds: string[] = [];
    if (template.userPrompt && template.userPrompt.length > 0) {
      template.userPrompt.forEach(prompt => {
        if (template.bindings) {
          template.bindings.forEach(binding => {
            if (binding[prompt]) {
              const bindingDirection = getBindingDirection(binding);
              const bindingId = `${binding.type}-${bindingDirection}`;
              if (!requiredBindingIds.includes(bindingId)) {
                requiredBindingIds.push(bindingId);
              }
            }
          });
        }
      });
    }
    return requiredBindingIds;
  };

  // Not all bindings are required for function creation
  // Only display bindings that are list in the function template 'userPrompt'
  const getRequiredCreationBindings = (bindings: Binding[], userPrompt: string[]): Binding[] => {
    const requiredBindings: Binding[] = [];
    bindings.forEach(binding => {
      const requiredBinding = binding;
      requiredBinding.settings =
        binding.settings &&
        binding.settings.filter(setting => {
          return userPrompt.find(prompt => prompt === setting.name);
        });
      requiredBindings.push(requiredBinding);
    });
    return requiredBindings;
  };

  const createBuilder = () => {
    if (!!functionsInfo && !!bindings && !!resourceId) {
      /** @todo (joechung): Use CosmosDbFunctionFormBuilder instead for Cosmos DB triggers. */
      setBuilder(
        new CreateFunctionFormBuilder(
          selectedTemplate.bindings ?? [],
          bindings,
          resourceId,
          functionsInfo,
          selectedTemplate.defaultFunctionName || 'NewFunction',
          t
        )
      );
    }
  };

  const getDetails = () => {
    return !functionsInfo || !bindings || !builder ? (
      <BasicShimmerLines />
    ) : (
      builder.getFields(formProps, !!functionCreateContext.creatingFunction, false, armResources, setArmResources)
    );
  };

  useEffect(() => {
    createBuilder();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [functionsInfo, bindings, resourceId]);

  useEffect(() => {
    setBindings(undefined);
    setBuilder(undefined);
    fetchBindings();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate]);

  useEffect(() => {
    fetchFunctionInfo();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return functionsInfo === null || bindings === null ? (
    <>{/** TODO(krmitta): Add banner when call fails */}</>
  ) : (
    <div className={detailContainerStyle}>
      <h3>{t('templateDetails')}</h3>
      <p>
        {t('detailDescription').format(selectedTemplate.name)}
        <Link href={Links.functionCreateBindingsLearnMore}>{t('learnMore')}</Link>
      </p>
      {getDetails()}
    </div>
  );
};

export default TemplateDetail;
